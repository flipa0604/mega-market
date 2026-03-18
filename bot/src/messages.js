const TEXTS = {
  uz: {
    welcome: 'Assalomu alaykum! Tilni tanlang:',
    regFirstName: 'Ismingizni kiriting:',
    regLastName: 'Familyangizni kiriting:',
    regPhone: 'Telefon raqamingizni yuboring (pastdagi tugmani bosing):',
    mainMenu: 'Asosiy menyu:',
    noCategories: 'Hozircha kategoriyalar yo\'q. Admin panelda kategoriya qo\'shing.',
    noProducts: 'Hozircha mahsulotlar yo\'q.',
    back: '🔙 Orqaga',
    addedToCart: '✅ Savatga qo\'shildi.',
    askQuantity: 'Nechta dona qo\'shamiz? Sonni yozing yoki tugmalardan tanlang:',
    askEditQuantity: 'Yangi sonni kiriting (1–99). Sonni yozing yoki tugmalardan tanlang:',
    cartEmpty: 'Savatingiz bo\'sh.',
    sendLocation: 'Buyurtmani yakunlash uchun yetkazib berish manzilini yuboring (pastdagi tugmani bosing):',
    orderThanks: '✅ Buyurtmangiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.',
    orderError: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.',
  },
  ru: {
    welcome: 'Здравствуйте! Выберите язык:',
    regFirstName: 'Введите ваше имя:',
    regLastName: 'Введите вашу фамилию:',
    regPhone: 'Отправьте номер телефона (нажмите кнопку ниже):',
    mainMenu: 'Главное меню:',
    noCategories: 'Категорий пока нет. Добавьте категорию в админ-панели.',
    noProducts: 'Товаров пока нет.',
    back: '🔙 Назад',
    addedToCart: '✅ Добавлено в корзину.',
    askQuantity: 'Сколько штук добавить? Введите число или выберите кнопку:',
    askEditQuantity: 'Введите новое количество (1–99). Число или кнопка:',
    sendLocation: 'Чтобы оформить заказ, отправьте адрес доставки (нажмите кнопку ниже):',
    orderThanks: '✅ Ваш заказ принят! Мы скоро с вами свяжемся.',
    orderError: 'Произошла ошибка. Попробуйте снова.',
    cartEmpty: 'Ваша корзина пуста.',
  },
};

function t(lang, key) {
  return TEXTS[lang]?.[key] ?? TEXTS.uz[key] ?? key;
}

module.exports = { TEXTS, t };
