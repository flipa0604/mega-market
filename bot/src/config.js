require('dotenv').config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  adminTelegramId: process.env.ADMIN_TELEGRAM_ID
    ? parseInt(process.env.ADMIN_TELEGRAM_ID, 10)
    : null,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (() => {
      const raw = process.env.FIREBASE_PRIVATE_KEY;
      if (!raw) return undefined;
      const withNewlines = raw.replace(/\\n/g, '\n');
      if (withNewlines.includes('\n')) return withNewlines;
      const begin = '-----BEGIN PRIVATE KEY-----';
      const end = '-----END PRIVATE KEY-----';
      if (withNewlines.includes(begin) && withNewlines.includes(end)) {
        const middle = withNewlines.replace(begin, '').replace(end, '').replace(/\s/g, '');
        return `${begin}\n${middle.match(/.{1,64}/g).join('\n')}\n${end}\n`;
      }
      return withNewlines;
    })(),
  },
};
