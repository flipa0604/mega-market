const { Telegraf } = require('telegraf');
const config = require('./config');
const session = require('./session');
const { LANGUAGES, mainMenu } = require('./keyboards');
const { handleStart } = require('./handlers/start');
const { handleLanguage } = require('./handlers/language');
const {
  handleRegFirstName,
  handleRegLastName,
  handleRegPhone,
} = require('./handlers/registration');
const { handleProducts, handleBack } = require('./handlers/menu');
const {
  handleCart,
  handleAddToCart,
  handleCartQuantity,
  handleRemoveFromCart,
  handleClearCart,
  handleCheckout,
} = require('./handlers/cart');
const { handleLocation } = require('./handlers/checkout');

if (!config.botToken) {
  console.error('Missing BOT_TOKEN in .env');
  process.exit(1);
}

const bot = new Telegraf(config.botToken);

bot.use(session);
bot.use((ctx, next) => {
  ctx.session = ctx.session || {};
  return next();
});

bot.start(handleStart);

bot.hears(Object.values(LANGUAGES), handleLanguage);

bot.on('text', async (ctx, next) => {
  const step = ctx.session?.step;
  const text = ctx.message?.text?.trim();
  const lang = ctx.session?.lang;

  if (step === 'reg_first_name') return handleRegFirstName(ctx) && next();
  if (step === 'reg_last_name') return handleRegLastName(ctx) && next();
  if (step === 'reg_phone') return next();
  if (step === 'add_cart_quantity') return handleCartQuantity(ctx) && next();

  const backUz = '🔙 Orqaga';
  const backRu = '🔙 Назад';
  if (text === backUz || text === backRu) return handleBack(ctx) && next();

  const productsUz = '🛍 Mahsulotlar';
  const productsRu = '🛍 Товары';
  if (text === productsUz || text === productsRu) return handleProducts(ctx) && next();

  const cartUz = '🛒 Savatim';
  const cartRu = '🛒 Моя корзина';
  if (text === cartUz || text === cartRu) return handleCart(ctx) && next();

  return next();
});

bot.on('contact', (ctx, next) => {
  if (ctx.session?.step === 'reg_phone') return handleRegPhone(ctx) && next();
  return next();
});

bot.on('location', (ctx, next) => {
  if (ctx.session?.step === 'await_location') return handleLocation(ctx) && next();
  return next();
});

bot.action(/^add_cart:(.+)$/, handleAddToCart);
bot.action(/^remove_cart:(\d+)$/, handleRemoveFromCart);
bot.action('clear_cart', handleClearCart);
bot.action('checkout_cart', handleCheckout);

bot.launch().then(() => console.log('Bot started'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
