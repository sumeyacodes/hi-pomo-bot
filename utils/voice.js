import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";
import { SOUND_CONFIG } from "../config.js";

// Connects the bot to a voice channel
export const connectToVoice = (voiceChannel) => {
  return joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });
};

// Mutes/unmutes all non-bot members in a voice channel
export const muteMembersInChannel = async (voiceChannel, mute) => {
  if (!voiceChannel) return;
  for (const [_, member] of voiceChannel.members) {
    if (member.user.bot) continue; // Skip bot users
    try {
      await member.voice.setMute(mute);
    } catch (error) {
      console.error("Error muting member:", error);
    }
  }
};

// Plays the chime sound when timer completes
export const playChime = (connection) => {
  const player = createAudioPlayer();
  const resource = createAudioResource(SOUND_CONFIG.CHIME_PATH);
  player.play(resource);
  connection.subscribe(player);

  // Error handling for audio playback
  player.on("error", (error) =>
    console.error(`Error playing sound: ${error.message}`)
  );
};
