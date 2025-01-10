import { GatewayIntentBits } from "discord.js";
import path from "path";

// Timer durations and update frequency in milliseconds
export const TIMER_SETTINGS = {
  FOCUS: 25 * 60 * 1000, // 25 minutes focus session
  SHORT_BREAK: 5 * 60 * 1000, // 5 minutes break
  LONG_BREAK: 15 * 60 * 1000, // 15 minutes break
  UPDATE_INTERVAL: 5000, // Update timer display every 5 seconds to avoid rate limits
};

// Discord bot permissions and features it needs access to
export const CLIENT_CONFIG = {
  intents: [
    GatewayIntentBits.Guilds, // Access to server info
    GatewayIntentBits.GuildMessages, // Read/send messages
    GatewayIntentBits.MessageContent, // Read message content
    GatewayIntentBits.GuildVoiceStates, // Voice channel operations
  ],
};

// Audio configuration
export const SOUND_CONFIG = {
  CHIME_PATH: path.resolve("public/soft-chimes.mp3"), // Path to timer completion sound
};
