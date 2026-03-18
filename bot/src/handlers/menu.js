const { getCategories, getProductsByCategory } = require('../firebase');
const { backAndCartKeyboard, productInline, categoriesInline } = require('../keyboards');
const { t } = require('../messages');

async function handleProducts(ctx) {
  const lang = ctx.session?.lang || 'uz';
  const categories = await getCategories();
  if (!categories.length) {
    await ctx.reply(t(lang, 'noCategories'), backAndCartKeyboard(lang));
    return;
  }
  ctx.session.step = 'products_categories';
  const chooseCat = lang === 'uz' ? 'Kategoriyani tanlang:' : 'Выберите категорию:';
  await ctx.reply(chooseCat, categoriesInline(categories, lang));
  await ctx.reply(t(lang, 'back'), backAndCartKeyboard(lang));
}

async function handleCategorySelect(ctx) {
  const categoryId = ctx.match?.[1];
  if (!categoryId) return;
  await ctx.answerCbQuery();
  const lang = ctx.session?.lang || 'uz';
  const products = await getProductsByCategory(categoryId);
  ctx.session.step = 'products_list';
  ctx.session.selectedCategoryId = categoryId;
  if (!products.length) {
    await ctx.reply(t(lang, 'noProducts'), backAndCartKeyboard(lang));
    return;
  }
  for (const p of products) {
    const desc = (p.shortDescription || '').trim();
    const priceLine = lang === 'uz' ? `💰 Narxi: ${p.price} so'm` : `💰 Цена: ${p.price} сум`;
    const caption = desc ? `${p.name}\n\n${desc}\n\n${priceLine}` : `${p.name}\n\n${priceLine}`;
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
  const step = ctx.session?.step;
  const { mainMenu } = require('../keyboards');
  if (step === 'products_list') {
    ctx.session.step = 'products_categories';
    ctx.session.selectedCategoryId = null;
    const categories = await getCategories();
    if (!categories.length) {
      ctx.session.step = 'main';
      await ctx.reply(t(lang, 'mainMenu'), mainMenu(lang));
      return true;
    }
    const chooseCat = lang === 'uz' ? 'Kategoriyani tanlang:' : 'Выберите категорию:';
    await ctx.reply(chooseCat, categoriesInline(categories, lang));
    await ctx.reply(t(lang, 'back'), backAndCartKeyboard(lang));
    return true;
  }
  if (step === 'products_categories') {
    ctx.session.step = 'main';
    await ctx.reply(t(lang, 'mainMenu'), mainMenu(lang));
    return true;
  }
  ctx.session.step = 'main';
  await ctx.reply(t(lang, 'mainMenu'), mainMenu(lang));
  return true;
}

module.exports = { handleProducts, handleCategorySelect, handleBack };
