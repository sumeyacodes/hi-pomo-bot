export default {
  apps: [
    {
      name: "hi-pomo-bot",
      script: "bot.js",
      watch: true,
      env: {
        NODE_ENV: "production",
      },
      // Restart if the app crashes
      autorestart: true,
      // Restart if memory exceeds 1GB
      max_memory_restart: "1G",
    },
  ],
};
