import { Client, EmbedBuilder } from "discord.js";
import { VoiceConnectionStatus, entersState } from "@discordjs/voice";
import { config } from "dotenv";
import { CLIENT_CONFIG, TIMER_SETTINGS, SOUND_CONFIG } from "./config.js";
import {
  createWelcomeMessage,
  formatTimerMessage,
  createCancelButton,
} from "./utils/messages.js";
import {
  connectToVoice,
  muteMembersInChannel,
  playChime,
} from "./utils/voice.js";
import fs from "fs";

// Load environment variables
config();

// Initialise Discord client
const client = new Client(CLIENT_CONFIG);

let currentSessionInterval;
let currentVoiceConnection;

// Verify sound file exists before starting
if (!fs.existsSync(SOUND_CONFIG.CHIME_PATH)) {
  console.error("Error: Sound file not found at", SOUND_CONFIG.CHIME_PATH);
  process.exit(1);
}

// Log when bot is ready and connected to Discord
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for the "hi pomo" command in chat
client.on("messageCreate", async (message) => {
  if (message.content.toLowerCase() === "hi pomo") {
    const welcomeMessage = createWelcomeMessage();
    // Send welcome message with session options
    await message.channel.send({
      embeds: [welcomeMessage.embed],
      components: [welcomeMessage.buttons],
    });
  }
});

// Handle all button interactions (session start, cancel)
client.on("interactionCreate", async (interaction) => {
  // Ignore non-button interactions
  if (!interaction.isButton()) return;

  const member = interaction.member;
  const voiceChannel = member?.voice.channel;

  // Check if user is in a voice channel
  if (!voiceChannel) {
    return interaction.reply({
      content: "You need to be in a voice channel!",
      ephemeral: true, // Only visible to the user who clicked
    });
  }

  await interaction.deferReply();

  // Handle session cancellation
  if (interaction.customId === "cancel_session") {
    if (currentSessionInterval) clearInterval(currentSessionInterval);
    await muteMembersInChannel(voiceChannel, false);

    const cancelEmbed = new EmbedBuilder()
      .setColor("#ff6b6b")
      .setTitle("Session Cancelled")
      .setDescription("Focus session has been cancelled.");

    await interaction.editReply({
      embeds: [cancelEmbed],
      components: [],
    });

    if (currentVoiceConnection) currentVoiceConnection.destroy();
    return;
  }

  // Connect to voice channel and set up event handlers
  currentVoiceConnection = connectToVoice(voiceChannel);

  // Voice connection event handlers
  currentVoiceConnection.on("ready", () => {
    console.log("Connected to the voice channel!");
  });

  // Handle disconnection attempts and reconnection
  currentVoiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(
          currentVoiceConnection,
          VoiceConnectionStatus.Signalling,
          5_000
        ),
        entersState(
          currentVoiceConnection,
          VoiceConnectionStatus.Connecting,
          5_000
        ),
      ]);
    } catch (error) {
      currentVoiceConnection.destroy();
      console.error("Voice connection disconnected:", error);
    }
  });

  // Handle voice connection errors
  currentVoiceConnection.on("error", (error) => {
    console.error(`Voice connection error: ${error.message}`);
    interaction.followUp(
      "An error occurred while connecting to the voice channel."
    );
  });

  // Main Pomodoro session handler
  const startPomoSession = async (focusDuration, breakDuration) => {
    // Mute all users at start of focus session
    await muteMembersInChannel(voiceChannel, true);
    let timerMessage = await interaction.editReply({
      ...formatTimerMessage("Focus", focusDuration),
      components: [createCancelButton()],
    });

    const startTime = Date.now();

    // Update timer every TIMER_SETTINGS.UPDATE_INTERVAL milliseconds
    currentSessionInterval = setInterval(async () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = focusDuration - elapsedTime;

      // When focus timer ends
      if (remainingTime <= 0) {
        clearInterval(currentSessionInterval);
        playChime(currentVoiceConnection);
        await muteMembersInChannel(voiceChannel, false);

        // Show completion message and start break
        const completionEmbed = new EmbedBuilder()
          .setColor("#43b581")
          .setTitle("Focus Session Complete! 🎉")
          .setDescription("Great work! Time for a break.")
          .addFields({
            name: "Next up",
            value: `${
              breakDuration === TIMER_SETTINGS.SHORT_BREAK ? "5" : "15"
            } minute break`,
          });

        await timerMessage.edit({
          embeds: [completionEmbed],
          components: [],
        });

        // Start break session
        await startBreak(
          breakDuration === TIMER_SETTINGS.SHORT_BREAK
            ? "Short Break"
            : "Long Break",
          breakDuration,
          timerMessage
        );
        return;
      }

      // Update timer display
      timerMessage.edit({
        ...formatTimerMessage("Focus", remainingTime),
        components: [createCancelButton()],
      });
    }, TIMER_SETTINGS.UPDATE_INTERVAL);
  };

  // Break session handler
  const startBreak = async (breakType, breakDuration, timerMessage) => {
    const startTime = Date.now();

    // Update break timer display
    currentSessionInterval = setInterval(async () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = breakDuration - elapsedTime;

      // When break timer ends
      if (remainingTime <= 0) {
        clearInterval(currentSessionInterval);

        // Show break completion message
        const breakCompletionEmbed = new EmbedBuilder()
          .setColor("#43b581")
          .setTitle("Break Complete! ⏰")
          .setDescription("Ready for another session?")
          .addFields({
            name: "Start New Session",
            value: 'Type "hi pomo" to begin',
          });

        await timerMessage.edit({
          embeds: [breakCompletionEmbed],
          components: [],
        });
        return;
      }

      // Update break timer display
      timerMessage.edit({
        ...formatTimerMessage(breakType, remainingTime),
        components: [],
      });
    }, TIMER_SETTINGS.UPDATE_INTERVAL);
  };

  // Handle session type selection
  if (interaction.customId === "focus_short") {
    await startPomoSession(TIMER_SETTINGS.FOCUS, TIMER_SETTINGS.SHORT_BREAK);
  } else if (interaction.customId === "focus_long") {
    await startPomoSession(TIMER_SETTINGS.FOCUS, TIMER_SETTINGS.LONG_BREAK);
  }
});

// Connect bot to Discord
client.login(process.env.BOT_TOKEN);
