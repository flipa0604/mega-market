const { getUser, getCart, clearCart, createOrder } = require('../firebase');
const config = require('../config');
const { mainMenu } = require('../keyboards');
const { t } = require('../messages');

function buildOrderSummary(user, cart, total) {
  const lines = [
    '📦 Yangi buyurtma',
    '',
    '👤 Kimdan:',
    `   Ism: ${user.firstName || ''} ${user.lastName || ''}`.trim(),
    `   Tel: ${user.phone || ''}`,
    '',
    '🛍 Mahsulotlar (qaysi mahsulot nechta):',
    ...cart.map((i) => {
      const qty = i.quantity || 1;
      const lineTotal = (i.price || 0) * qty;
      return `   • ${i.name} — ${qty} ta × ${i.price || 0} = ${lineTotal}`;
    }),
    '',
    `💰 Jami: ${total}`,
    '',
    '📍 Lokatsiya pastda (xarita + GPS)',
  ];
  return lines.join('\n');
}

async function handleLocation(ctx) {
  if (ctx.session?.step !== 'await_location') return false;
  const location = ctx.message?.location;
  if (!location) return false;

  const telegramId = ctx.from.id;
  const lang = ctx.session?.lang || 'uz';
  const user = await getUser(telegramId);
  const cart = await getCart(telegramId);

  if (!user || !cart.length) {
    ctx.session.step = 'main';
    await ctx.reply(t(lang, 'orderError'), mainMenu(lang));
    return true;
  }

  const total = cart.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  const orderId = await createOrder({
    userId: user.id,
    telegramId: String(telegramId),
    userName: `${user.firstName} ${user.lastName}`,
    userPhone: user.phone,
    items: cart,
    total,
    latitude: location.latitude,
    longitude: location.longitude,
  });

  const summary = buildOrderSummary(user, cart, total);
  const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

  const adminId = config.adminTelegramId;
  if (adminId) {
    try {
      await ctx.telegram.sendMessage(adminId, summary);
      await ctx.telegram.sendLocation(adminId, location.latitude, location.longitude);
      await ctx.telegram.sendMessage(
        adminId,
        `📍 Xaritada: ${mapUrl}\n\nBuyurtma ID: ${orderId}`
      );
    } catch (err) {
      console.error('Admin notification error:', err);
    }
  }

  await clearCart(telegramId);
  ctx.session.step = 'main';
  await ctx.reply(t(lang, 'orderThanks'), mainMenu(lang));
  return true;
}

module.exports = { handleLocation };
