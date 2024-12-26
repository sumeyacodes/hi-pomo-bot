import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import { joinVoiceChannel, VoiceConnectionStatus, createAudioPlayer, createAudioResource } from '@discordjs/voice';
import path from 'path';
import fs from 'fs';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const focusTime = 25 * 60;
const shortBreak = 5 * 60; 
const longBreak = 15 * 60; 

const activeSessions = new Map(); // Store active sessions

let timers = {}; // Store interval references to clear on cancel

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Step 1: Command to start interaction
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === 'hi pomo') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('focus_short')
        .setLabel(`Short Break (${shortBreak / 60} mins)`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('focus_long')
        .setLabel(`Long Break (${longBreak / 60} mins)`)
        .setStyle(ButtonStyle.Primary)
    );

    // Create an Embed with some styling
    const embed = new EmbedBuilder()
      .setColor('#cc95ab')
      .setTitle('Hi School of Coder 👋')
      .setDescription('Choose your focus session below:')
      .setFooter({ text: 'Pomodoro Body Doubling Sessions 👥' });

    // Send the message with embed and buttons
    message.channel.send({
      embeds: [embed],
      components: [row],
    });
  }
});

// Step 2: Handle button interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const voiceChannel = interaction.member.voice.channel;

  // Check if the member is in a voice channel
  if (!voiceChannel) {
    return interaction.reply({
      content: 'You need to join a voice channel first!',
      ephemeral: true,
    });
  }

  // Check if the user already has an active session
  if (activeSessions.has(interaction.user.id)) {
    return interaction.reply({
      content: 'You already have an active session. Please finish or cancel your current session.',
      ephemeral: true,
    });
  }

  // Mark the user as having an active session
  activeSessions.set(interaction.user.id, { type: 'focus' });

  // Countdown function that updates the message every second
  const countdown = (focusMessage, initialTime) => {
    let remainingTime = initialTime;
    const interval = setInterval(() => {
      if (remainingTime <= 0) {
        clearInterval(interval);
        // Play a sound when time's up (you can add your own sound)
        playSound(voiceChannel);
      } else {
        // Update the embed with the remaining time (in minutes:seconds format)
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const embed = new EmbedBuilder()
          .setColor('#cc95ab')
          .setTitle('Focus Session Countdown')
          .setDescription(`Time left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`)
          .setFooter({ text: 'Stay focused! ⏳' });

        focusMessage.edit({ embeds: [embed] });
        remainingTime--;
      }
    }, 1000);
    return interval; // Return the interval so we can clear it on cancel
  };

  // Create the cancel button
  const cancelButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel Session')
      .setStyle(ButtonStyle.Danger)
  );

  // Helper function to play a sound when the session ends
  const playSound = (channel) => {
    const soundPath = path.join(__dirname, 'soft-chimes.mp3');
    if (!fs.existsSync(soundPath)) return;

    const resource = createAudioResource(soundPath);
    const player = createAudioPlayer();
    player.play(resource);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);
    player.on('idle', () => connection.destroy());
  };

  // Handle focus short button
  if (interaction.customId === 'focus_short') {
    await interaction.reply({
      content: `Starting focus session: 25 minutes work and 5 minutes break.`,
      components: [cancelButton],
    });

    // Mute user in the voice channel during focus session
    await interaction.member.voice.setMute(true);

    // Join the voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log('The bot has successfully connected to the voice channel!');
    });

    // Create a message for the countdown and send it
    const focusMessage = await interaction.followUp({
      content: `Focus session is in progress...`,
      embeds: [
        new EmbedBuilder()
          .setColor('#cc95ab')
          .setTitle('Focus Session Countdown')
          .setDescription(`Time left: ${Math.floor(focusTime / 60)}:00`)
          .setFooter({ text: 'Stay focused! ⏳' })
      ]
    });

    // Start focus timer (work time)
    timers[interaction.user.id] = countdown(focusMessage, focusTime);

    // Wait for the focus timer to end
    await new Promise((resolve) => setTimeout(resolve, focusTime * 1000));
    await interaction.followUp(`Focus session is over. Now, enjoy your 5 minutes break.`);

    // Start break timer (short break)
    timers[interaction.user.id] = countdown(focusMessage, shortBreak);
    await new Promise((resolve) => setTimeout(resolve, shortBreak * 1000));
    await interaction.followUp('Break is over! Ready to start the next session?');

    // Unmute the user after the break
    await interaction.member.voice.setMute(false);

    // Remove the user from active sessions
    activeSessions.delete(interaction.user.id);

    // Disconnect from the voice channel after the session
    connection.destroy();
  } 
  // Handle focus long button
  else if (interaction.customId === 'focus_long') {
    await interaction.reply({
      content: `Starting focus session: 25 minutes work and 15 minutes break.`,
      components: [cancelButton],
    });

    // Mute user in the voice channel during focus session
    await interaction.member.voice.setMute(true);

    // Join the voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log('The bot has successfully connected to the voice channel!');
    });

    // Create a message for the countdown and send it
    const focusMessage = await interaction.followUp({
      content: `Focus session is in progress...`,
      embeds: [
        new EmbedBuilder()
          .setColor('#cc95ab')
          .setTitle('Focus Session Countdown')
          .setDescription(`Time left: ${Math.floor(focusTime / 60)}:00`)
          .setFooter({ text: 'Stay focused! 👀' })
      ]
    });

    // Start focus timer (work time)
    timers[interaction.user.id] = countdown(focusMessage, focusTime);

    // Wait for the focus timer to end
    await new Promise((resolve) => setTimeout(resolve, focusTime * 1000));
    await interaction.followUp(`Focus session is over. Now, enjoy your 15 minutes break.`);

    // Start break timer (long break)
    timers[interaction.user.id] = countdown(focusMessage, longBreak);
    await new Promise((resolve) => setTimeout(resolve, longBreak * 1000));
    await interaction.followUp('Break is over! Ready to start the next session?');

    // Unmute the user after the break
    await interaction.member.voice.setMute(false);

    // Remove the user from active sessions
    activeSessions.delete(interaction.user.id);

    // Disconnect from the voice channel after the session
    connection.destroy();
  }

  // Handle cancel button
  if (interaction.customId === 'cancel') {
    activeSessions.delete(interaction.user.id); // Remove user from active sessions

    // Clear the timer
    if (timers[interaction.user.id]) {
      clearInterval(timers[interaction.user.id]); // Clear the timer
    }

    // Unmute the user if they are muted
    await interaction.member.voice.setMute(false);

    // Send a cancel message to the user
    await interaction.reply({
      content: 'Session canceled.',
      ephemeral: true,
    });
  }
});

client.login(process.env.BOT_TOKEN);
