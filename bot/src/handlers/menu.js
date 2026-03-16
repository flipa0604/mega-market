const { getProducts } = require('../firebase');
const { backAndCartKeyboard, productInline } = require('../keyboards');
const { t } = require('../messages');

async function handleProducts(ctx) {
  const lang = ctx.session?.lang || 'uz';
  const products = await getProducts();
  if (!products.length) {
    await ctx.reply(t(lang, 'noProducts'), backAndCartKeyboard(lang));
    return;
  }
  for (const p of products) {
    const caption = `${p.name}\n${p.shortDescription || ''}\n💰 ${p.price}`;
    const photo = p.imageUrl || undefined;
    if (photo) {
      await ctx.replyWithPhoto(photo, {
        caption,
        ...productInline(p.id, lang),
      });
    } else {
      await ctx.reply(caption, productInline(p.id, lang));
    }
  }
  await ctx.reply(t(lang, 'back'), backAndCartKeyboard(lang));
}

async function handleBack(ctx) {
  const lang = ctx.session?.lang || 'uz';
  const { mainMenu } = require('../keyboards');
  ctx.session.step = 'main';
  await ctx.reply(t(lang, 'mainMenu'), mainMenu(lang));
  return true;
}

module.exports = { handleProducts, handleBack };
