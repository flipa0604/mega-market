const { Markup } = require('telegraf');
const config = require('./config');

const BTN = {
  uz: {
    cart: '🟪 🛒 Savatim',
    back: '🟦 🔙 Orqaga',
  },
  ru: {
    cart: '🟪 🛒 Моя корзина',
    back: '🟦 🔙 Назад',
  },
};

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
  const b = lang === 'ru' ? BTN.ru : BTN.uz;
  const shopLabel = lang === 'ru' ? '🛍 Магазин' : "🛍 Do'kon";
  const shopUrl = (config.shopUrl || '').replace(/\/$/, '') || 'https://nodirmega.uz';
  return Markup.keyboard([
    [Markup.button.webApp(shopLabel, shopUrl)],
    [Markup.button.text(b.cart)],
  ])
    .resize()
    .persistent();
}

function backButton(lang) {
  const b = lang === 'ru' ? BTN.ru : BTN.uz;
  return Markup.keyboard([[Markup.button.text(b.back)]])
    .resize()
    .oneTime();
}

function backAndCartKeyboard(lang) {
  const b = lang === 'ru' ? BTN.ru : BTN.uz;
  return Markup.keyboard([
    [Markup.button.text(b.back), Markup.button.text(b.cart)],
  ])
    .resize()
    .oneTime();
}

function quantityKeyboard(lang) {
  const b = lang === 'ru' ? BTN.ru : BTN.uz;
  return Markup.keyboard([
    [Markup.button.text('1'), Markup.button.text('2'), Markup.button.text('3')],
    [Markup.button.text('5'), Markup.button.text('10')],
    [Markup.button.text(b.back)],
  ])
    .resize()
    .oneTime();
}

function cartInlineKeyboard(lang, itemCount) {
  const isUz = lang === 'uz';
  const editPrefix = isUz ? "🟡 O'zgartirish" : '🟡 Изменить';
  const clearText = isUz ? '🔄 Savatni tozalash' : '🔄 Очистить корзину';
  const checkoutText = isUz ? '🚀 Buyurtma yuborish' : '🚀 Оформить заказ';
  const buttons = [];
  for (let i = 0; i < itemCount; i++) {
    buttons.push([Markup.button.callback(`${editPrefix} #${i + 1}`, `edit_qty:${i}`)]);
  }
  if (itemCount > 0) {
    buttons.push([Markup.button.callback(clearText, 'clear_cart')]);
    buttons.push([Markup.button.callback(checkoutText, 'checkout_cart')]);
  }
  return Markup.inlineKeyboard(buttons);
}

module.exports = {
  BTN,
  LANGUAGES,
  languageKeyboard,
  requestPhone,
  requestLocation,
  mainMenu,
  backButton,
  backAndCartKeyboard,
  quantityKeyboard,
  cartInlineKeyboard,
};
