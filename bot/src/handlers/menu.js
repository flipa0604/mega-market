const { mainMenu } = require('../keyboards');
const { t } = require('../messages');

async function handleBack(ctx) {
  const lang = ctx.session?.lang || 'uz';
  ctx.session.step = 'main';
  await ctx.reply(t(lang, 'mainMenu'), mainMenu(lang));
  return true;
}

module.exports = { handleBack };
