const { getCart, setCart, getProduct } = require('../firebase');
const { backButton, backAndCartKeyboard, cartInlineKeyboard, quantityKeyboard } = require('../keyboards');
const { t } = require('../messages');

async function handleCart(ctx) {
  const lang = ctx.session?.lang || 'uz';
  const telegramId = ctx.from.id;
  const cart = await getCart(telegramId);

  if (!cart.length) {
    await ctx.reply(t(lang, 'cartEmpty'), backAndCartKeyboard(lang));
    return;
  }

  let total = 0;
  const lines = [];
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const product = await getProduct(item.productId);
    const name = product ? product.name : item.productId;
    const price = product ? product.price : item.price || 0;
    const qty = item.quantity || 1;
    total += price * qty;
    lines.push(`${i + 1}. ${name} x${qty} — ${price * qty}`);
  }
  const totalLabel = lang === 'uz' ? 'Jami' : 'Итого';
  lines.push(`\n💰 ${totalLabel}: ${total}`);
  await ctx.reply(lines.join('\n'), backAndCartKeyboard(lang));
  await ctx.reply(lang === 'uz' ? 'O\'chirish yoki buyurtma berish:' : 'Удалить или оформить заказ:', cartInlineKeyboard(lang, cart.length));
}

async function handleAddToCart(ctx) {
  const productId = ctx.match?.[1];
  if (!productId) return;
  const telegramId = ctx.from.id;
  const product = await getProduct(productId);
  if (!product) return ctx.answerCbQuery('Product not found');

  ctx.session.step = 'add_cart_quantity';
  ctx.session.pendingProductId = productId;
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx.session?.lang || 'uz', 'askQuantity'), quantityKeyboard(ctx.session?.lang || 'uz'));
}

async function handleCartQuantity(ctx) {
  const text = ctx.message?.text?.trim();
  const lang = ctx.session?.lang || 'uz';
  const productId = ctx.session?.pendingProductId;
  if (!productId) {
    ctx.session.step = 'main';
    return false;
  }

  const backUz = '🔙 Orqaga';
  const backRu = '🔙 Назад';
  if (text === backUz || text === backRu) {
    ctx.session.step = 'main';
    ctx.session.pendingProductId = null;
    const { mainMenu } = require('../keyboards');
    await ctx.reply(t(lang, 'mainMenu'), mainMenu(lang));
    return true;
  }

  const qty = parseInt(text, 10);
  if (isNaN(qty) || qty < 1 || qty > 99) {
    await ctx.reply(lang === 'uz' ? '1 dan 99 gacha son kiriting.' : 'Введите число от 1 до 99.', quantityKeyboard(lang));
    return true;
  }

  const product = await getProduct(productId);
  if (!product) {
    ctx.session.step = 'main';
    ctx.session.pendingProductId = null;
    await ctx.reply(t(lang, 'orderError'), require('../keyboards').mainMenu(lang));
    return true;
  }

  const telegramId = ctx.from.id;
  const cart = await getCart(telegramId);
  const existing = cart.find((x) => x.productId === productId);
  if (existing) {
    existing.quantity = (existing.quantity || 0) + qty;
  } else {
    cart.push({
      productId,
      name: product.name,
      price: product.price,
      quantity: qty,
    });
  }
  await setCart(telegramId, cart);

  ctx.session.step = 'main';
  ctx.session.pendingProductId = null;
  const { mainMenu } = require('../keyboards');
  await ctx.reply(t(lang, 'addedToCart'), mainMenu(lang));
  return true;
}

async function handleRemoveFromCart(ctx) {
  const index = parseInt(ctx.match?.[1], 10);
  if (isNaN(index)) return;
  const telegramId = ctx.from.id;
  let cart = await getCart(telegramId);
  if (index < 0 || index >= cart.length) return ctx.answerCbQuery();
  cart = cart.filter((_, i) => i !== index);
  await setCart(telegramId, cart);
  await ctx.answerCbQuery();
  const msg = ctx.session?.lang === 'ru' ? 'Удалено из корзины.' : 'Savatdan o\'chirildi.';
  await ctx.reply(msg);
}

async function handleClearCart(ctx) {
  const telegramId = ctx.from.id;
  await setCart(telegramId, []);
  await ctx.answerCbQuery();
  const lang = ctx.session?.lang || 'uz';
  await ctx.reply(lang === 'uz' ? 'Savat tozalandi.' : 'Корзина очищена.');
}

async function handleCheckout(ctx) {
  const lang = ctx.session?.lang || 'uz';
  const telegramId = ctx.from.id;
  const cart = await getCart(telegramId);
  if (!cart.length) {
    await ctx.answerCbQuery();
    return ctx.reply(t(lang, 'cartEmpty'));
  }
  ctx.session.step = 'await_location';
  const { requestLocation } = require('../keyboards');
  await ctx.answerCbQuery();
  await ctx.reply(t(lang, 'sendLocation'), requestLocation(lang));
}

module.exports = {
  handleCart,
  handleAddToCart,
  handleCartQuantity,
  handleRemoveFromCart,
  handleClearCart,
  handleCheckout,
};
