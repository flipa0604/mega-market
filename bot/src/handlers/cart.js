const { getCart, setCart, getProduct } = require('../firebase');
const { backAndCartKeyboard, cartInlineKeyboard, quantityKeyboard, BTN, mainMenu } = require('../keyboards');
const { t } = require('../messages');

function isBackText(text, lang) {
  const b = lang === 'ru' ? BTN.ru : BTN.uz;
  return text === b.back;
}

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
  const hint = lang === 'uz' ? "O'zgartirish yoki buyurtma berish:" : 'Изменить или оформить заказ:';
  await ctx.reply(hint, cartInlineKeyboard(lang, cart.length));
}

async function handleAddToCart(ctx) {
  const productId = ctx.match?.[1];
  if (!productId) return;
  const product = await getProduct(productId);
  if (!product) return ctx.answerCbQuery('Product not found');

  ctx.session.step = 'add_cart_quantity';
  ctx.session.pendingProductId = productId;
  ctx.session.pendingCartIndex = null;
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx.session?.lang || 'uz', 'askQuantity'), quantityKeyboard(ctx.session?.lang || 'uz'));
}

async function handleEditCartQtyStart(ctx) {
  const index = parseInt(ctx.match?.[1], 10);
  if (isNaN(index)) return;
  const telegramId = ctx.from.id;
  const cart = await getCart(telegramId);
  if (index < 0 || index >= cart.length) return ctx.answerCbQuery();

  const lang = ctx.session?.lang || 'uz';
  ctx.session.step = 'edit_cart_quantity';
  ctx.session.pendingCartIndex = index;
  ctx.session.pendingProductId = null;
  await ctx.answerCbQuery();
  await ctx.reply(t(lang, 'askEditQuantity'), quantityKeyboard(lang));
}

async function handleCartQuantity(ctx) {
  const text = ctx.message?.text?.trim();
  const lang = ctx.session?.lang || 'uz';
  const productId = ctx.session?.pendingProductId;

  if (ctx.session?.step !== 'add_cart_quantity' || !productId) {
    return false;
  }

  if (isBackText(text, lang)) {
    ctx.session.step = 'main';
    ctx.session.pendingProductId = null;
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
    await ctx.reply(t(lang, 'orderError'), mainMenu(lang));
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
  await ctx.reply(t(lang, 'addedToCart'), mainMenu(lang));
  return true;
}

async function handleEditCartQuantity(ctx) {
  const text = ctx.message?.text?.trim();
  const lang = ctx.session?.lang || 'uz';
  const index = ctx.session?.pendingCartIndex;

  if (ctx.session?.step !== 'edit_cart_quantity' || index == null || isNaN(index)) {
    return false;
  }

  if (isBackText(text, lang)) {
    ctx.session.step = 'main';
    ctx.session.pendingCartIndex = null;
    await ctx.reply(t(lang, 'mainMenu'), mainMenu(lang));
    return true;
  }

  const qty = parseInt(text, 10);
  if (isNaN(qty) || qty < 1 || qty > 99) {
    await ctx.reply(lang === 'uz' ? '1 dan 99 gacha son kiriting.' : 'Введите число от 1 до 99.', quantityKeyboard(lang));
    return true;
  }

  const telegramId = ctx.from.id;
  const cart = await getCart(telegramId);
  if (index < 0 || index >= cart.length) {
    ctx.session.step = 'main';
    ctx.session.pendingCartIndex = null;
    await ctx.reply(t(lang, 'orderError'), mainMenu(lang));
    return true;
  }

  cart[index].quantity = qty;
  await setCart(telegramId, cart);

  ctx.session.step = 'main';
  ctx.session.pendingCartIndex = null;
  const msg = lang === 'uz' ? '✅ Soni yangilandi.' : '✅ Количество обновлено.';
  await ctx.reply(msg, mainMenu(lang));
  return true;
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
  handleEditCartQtyStart,
  handleCartQuantity,
  handleEditCartQuantity,
  handleClearCart,
  handleCheckout,
};
