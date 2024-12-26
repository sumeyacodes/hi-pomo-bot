import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import { joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';

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


client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// building the ui for messages
  // listen for message 'hi pomo' in any channel
  // if 'hi pomo' - build the welcome message and button options 
  // show the welcome message and button options in channel

// interaction 
  // get user choice option 
  // apply user choice option to voice channel member is in
  // mute user & everyone in voice channel
  // start timer for focus session with break countdown 
  // change messages to show focus session started
  // show countdown timer for focus session
  // show cancel button 
    // - if user presses session ends

// timer ends functionality
  // timer bell sound plays
  // unmute everyone
  // message changes (or message is sent) - focus session ended, break timer started
  // break timer countdown shows
  // once count down ends show message "thanks for using hipomo, call hi pomo to start again"

// SECTIONS

// ui / messages 
  // welcome message
  // button options long & short

// interaction 
  // user selects short break button
    // call function short focus session 
    // mute user & everyone in voice channel
  // user selects long break button
    // call function long focus session 

// timer functions
  // function short focus session
    // countdown for 25min focus
    // countdown for 5 min focus

  // function long focus session
  // countdown for 25min focus
  // countdown for 15 min focus


client.login(process.env.BOT_TOKEN);
