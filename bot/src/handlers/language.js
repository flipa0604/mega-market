const { LANGUAGES } = require('../keyboards');
const { mainMenu } = require('../keyboards');
const { getUser } = require('../firebase');
const { t } = require('../messages');

const langByText = {
  [LANGUAGES.uz]: 'uz',
  [LANGUAGES.ru]: 'ru',
};

async function handleLanguage(ctx) {
  const text = ctx.message?.text;
  const lang = langByText[text];
  if (!lang) return false;

  ctx.session.lang = lang;
  const telegramId = ctx.from.id;
  const user = await getUser(telegramId);

  if (user) {
    await ctx.reply(t(lang, 'mainMenu'), mainMenu(lang));
    ctx.session.step = 'main';
    return true;
  }

  ctx.session.step = 'reg_first_name';
  await ctx.reply(t(lang, 'regFirstName'));
  return true;
}

module.exports = { handleLanguage };
