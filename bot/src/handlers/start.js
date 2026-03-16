const { languageKeyboard } = require('../keyboards');
const { t } = require('../messages');

async function handleStart(ctx) {
  if (ctx.from?.username === 'hotamov_n') {
    console.log(`\n>>> ADMIN_TELEGRAM_ID (@hotamov_n): ${ctx.from.id} — shu raqamni bot/.env da ADMIN_TELEGRAM_ID=... ga yozing\n`);
  }
  ctx.session = ctx.session || {};
  ctx.session.step = 'language';
  ctx.session.lang = null;
  ctx.session.pendingFirstName = null;
  ctx.session.pendingLastName = null;

  await ctx.reply(t('uz', 'welcome'), languageKeyboard());
}

module.exports = { handleStart };
