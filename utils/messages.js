import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

// Creates the initial welcome message when user types "hi pomo"
export const createWelcomeMessage = () => {
  return {
    // Embed with title and description
    embed: new EmbedBuilder()
      .setColor("#76a0c4")
      .setTitle("Hi School of Coder 👋")
      .setDescription("Choose your focus session below:"),
    // Two buttons for different session types
    buttons: new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("focus_short")
        .setLabel(`Short Break (5 mins)`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("focus_long")
        .setLabel(`Long Break  (15 mins)`)
        .setStyle(ButtonStyle.Primary)
    ),
  };
};

// Formats the countdown timer message
export const formatTimerMessage = (type, timeRemaining) => {
  // Convert milliseconds to minutes and seconds
  const totalSeconds = Math.floor(timeRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Create embed for timer display
  const sessionTitle =
  type === "Focus" ? "Focus Session In Progress" : `${type} In Progress`;

  // Create embed for timer display
  const timerEmbed = new EmbedBuilder()
    .setColor("#86bf7a")
    .setTitle(sessionTitle)
    .setDescription(
      `Time left: ${minutes.toString()}:${seconds.toString().padStart(2, "0")}`
    )
    .setFooter({
      text: type === "Focus" ? "Stay focused! 👀" : "Time to relax! ☕",
    });

  return {
    content: `${type} session is in progress...`,
    embeds: [timerEmbed],
  };
};

// Creates the cancel button that appears during active sessions
export const createCancelButton = () => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("cancel_session")
      .setLabel("Cancel Session")
      .setStyle(ButtonStyle.Danger)
  );
};

export const createCancelledMessage = () => {
      const cancelMessageEmbed = new EmbedBuilder()
      .setColor("#ff6b6b")
      .setTitle("Session Cancelled")
      .setDescription("Focus session has been cancelled.");
      return {
        embeds: [cancelMessageEmbed],
      };
}