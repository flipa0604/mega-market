const { createUser } = require('../firebase');
const { requestPhone, mainMenu } = require('../keyboards');
const { t } = require('../messages');

async function handleRegFirstName(ctx) {
  const name = ctx.message?.text?.trim();
  if (!name) return false;
  ctx.session.pendingFirstName = name;
  ctx.session.step = 'reg_last_name';
  await ctx.reply(t(ctx.session.lang, 'regLastName'));
  return true;
}

async function handleRegLastName(ctx) {
  const name = ctx.message?.text?.trim();
  if (!name) return false;
  ctx.session.pendingLastName = name;
  ctx.session.step = 'reg_phone';
  await ctx.reply(t(ctx.session.lang, 'regPhone'), requestPhone(ctx.session.lang));
  return true;
}

async function handleRegPhone(ctx) {
  const contact = ctx.message?.contact;
  if (!contact) return false;

  const telegramId = ctx.from.id;
  const lang = ctx.session.lang;
  await createUser(telegramId, {
    firstName: ctx.session.pendingFirstName,
    lastName: ctx.session.pendingLastName,
    phone: contact.phone_number,
    lang,
    cart: [],
  });

  ctx.session.step = 'main';
  ctx.session.pendingFirstName = null;
  ctx.session.pendingLastName = null;
  await ctx.reply(t(lang, 'mainMenu'), mainMenu(lang));
  return true;
}

module.exports = {
  handleRegFirstName,
  handleRegLastName,
  handleRegPhone,
};
