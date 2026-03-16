const { Markup } = require('telegraf');

const LANGUAGES = {
  uz: '🇺🇿 O\'zbek',
  ru: '🇷🇺 Русский',
};

function languageKeyboard() {
  return Markup.keyboard([
    [Markup.button.text(LANGUAGES.uz), Markup.button.text(LANGUAGES.ru)],
  ])
    .resize()
    .oneTime();
}

function requestPhone(lang) {
  const text = lang === 'ru' ? 'Отправить номер телефона' : 'Telefon raqamini yuborish';
  return Markup.keyboard([[Markup.button.contactRequest(text)]])
    .resize()
    .oneTime();
}

function requestLocation(lang) {
  const text = lang === 'ru' ? 'Отправить местоположение доставки' : 'Yetkazib berish manzilini yuborish';
  return Markup.keyboard([[Markup.button.locationRequest(text)]])
    .resize()
    .oneTime();
}

function mainMenu(lang) {
  const isUz = lang === 'uz';
  return Markup.keyboard([
    [Markup.button.text(isUz ? '🛍 Mahsulotlar' : '🛍 Товары')],
    [Markup.button.text(isUz ? '🛒 Savatim' : '🛒 Моя корзина')],
  ])
    .resize()
    .persistent();
}

function backButton(lang) {
  const text = lang === 'uz' ? '🔙 Orqaga' : '🔙 Назад';
  return Markup.keyboard([[Markup.button.text(text)]])
    .resize()
    .oneTime();
}

function backAndCartKeyboard(lang) {
  const isUz = lang === 'uz';
  return Markup.keyboard([
    [
      Markup.button.text(isUz ? '🔙 Orqaga' : '🔙 Назад'),
      Markup.button.text(isUz ? '🛒 Savatim' : '🛒 Моя корзина'),
    ],
  ])
    .resize()
    .oneTime();
}

function quantityKeyboard(lang) {
  const isUz = lang === 'uz';
  return Markup.keyboard([
    [Markup.button.text('1'), Markup.button.text('2'), Markup.button.text('3')],
    [Markup.button.text('5'), Markup.button.text('10')],
    [Markup.button.text(isUz ? '🔙 Orqaga' : '🔙 Назад')],
  ])
    .resize()
    .oneTime();
}

function productInline(productId, lang) {
  const addText = lang === 'uz' ? 'Savatchaga qo\'shish' : 'В корзину';
  return Markup.inlineKeyboard([
    [Markup.button.callback(addText, `add_cart:${productId}`)],
  ]);
}

function cartInlineKeyboard(lang, itemCount) {
  const isUz = lang === 'uz';
  const removePrefix = isUz ? "O'chirish" : 'Удалить';
  const clearText = isUz ? '🔄 Savatni tozalash' : '🔄 Очистить корзину';
  const checkoutText = isUz ? '🚀 Buyurtma yuborish' : '🚀 Оформить заказ';
  const buttons = [];
  for (let i = 0; i < itemCount; i++) {
    buttons.push([Markup.button.callback(`${removePrefix} #${i + 1}`, `remove_cart:${i}`)]);
  }
  if (itemCount > 0) {
    buttons.push([Markup.button.callback(clearText, 'clear_cart')]);
    buttons.push([Markup.button.callback(checkoutText, 'checkout_cart')]);
  }
  return Markup.inlineKeyboard(buttons);
}

module.exports = {
  LANGUAGES,
  languageKeyboard,
  requestPhone,
  requestLocation,
  mainMenu,
  backButton,
  backAndCartKeyboard,
  quantityKeyboard,
  productInline,
  cartInlineKeyboard,
};
