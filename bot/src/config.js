require('dotenv').config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  adminTelegramId: process.env.ADMIN_TELEGRAM_ID
    ? parseInt(process.env.ADMIN_TELEGRAM_ID, 10)
    : null,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
};
