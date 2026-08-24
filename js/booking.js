// ===== BOOKING SYSTEM =====
// Глобальные переменные
let currentStep = 1;
let currentBookingPrice = 0;
let currentBookingName = 'Невеста';
let currentBookingDesc = '';
let isPackageBooking = false;
let bookingPlayersValue = 1;
let selectedDate = null;
let selectedTime = null;
let selectedPackageQuest = '';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const today = new Date();
today.setHours(0, 0, 0, 0);
let promoApplied = false;
let promoCode = 'квест10';
let isWeekday = true;

function formatDateKey(date) {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function selectedDateKey() {
  if (!selectedDate) return '';
  return formatDateKey(selectedDate);
}

function externalBookingApi() {
  return window.QuestBookingApi || null;
}

// ============================================================
// ===== ЭКРАНИРОВАНИЕ ДЛЯ HTML-АТРИБУТОВ =====
// (защищает от поломки вёрстки, если в названии/описании есть кавычки —
//  например 'Стоматология "Новая жизнь"')
// ============================================================
function escapeAttr(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================================
// ===== ДАННЫЕ КВЕСТОВ С ЦЕНАМИ ПО ВРЕМЕНИ =====
// ============================================================
const questsData = [
  { 
    name: 'Стоматология "Новая жизнь"', 
    price: 6500, 
    time: '60 мин', 
    players: '1–6', 
    difficulty: '4/5', 
    photos: ['imeges/stomatologiya/1.webp', 'imeges/stomatologiya/2.webp', 'imeges/stomatologiya/3.webp', 'imeges/stomatologiya/4.webp'], 
    loc: 'м. Профсоюзная',
    prices: {
      '00:00-01:15': 7990,
      '09:00': 6500,
      '10:15': 6990,
      '11:30-17:45': 7500,
      '19:00-22:45': 6990
    }
  },
  { 
    name: 'Рик и Морти', 
    price: 6500, 
    time: '60 мин', 
    players: '1–6', 
    difficulty: '3/5', 
    photos: ['imeges/rick-and-morty/1.webp', 'imeges/rick-and-morty/2.webp', 'imeges/rick-and-morty/3.webp', 'imeges/rick-and-morty/4.webp'], 
    loc: 'м. Профсоюзная',
    prices: {
      '00:00-01:15': 7990,
      '09:00': 6500,
      '10:15': 6990,
      '11:30-17:45': 7500,
      '19:00-22:45': 6990
    }
  },
  { 
    name: 'K-pop: последний стрим', 
    price: 5500, 
    time: '75 мин', 
    players: '1–8', 
    difficulty: '4/5', 
    photos: ['imeges/k-pop/1.webp', 'imeges/k-pop/2.webp', 'imeges/k-pop/3.webp'], 
    loc: 'м. Профсоюзная',
    prices: {
      '00:15-01:30': 8500,
      '09:15': 5500,
      '10:30': 5990,
      '11:45-20:30': 6500,
      '21:45-23:00': 5990
    }
  },
  { 
    name: 'Хоррор-свидание', 
    price: 10000, 
    time: '60-90 мин', 
    players: '1–8', 
    difficulty: '4/5', 
    photos: ['imeges/horror-svidanie/1.webp', 'imeges/horror-svidanie/2.webp'], 
    loc: 'м. Профсоюзная',
    prices: {
      '00:00-01:15': 15000,
      '09:00-22:45': 10000
    }
  },
  { 
    name: 'Запретная дверь', 
    price: 4990, 
    time: '70 мин', 
    players: '1–5', 
    difficulty: '5/5', 
    photos: ['imeges/zapretnaya-dver/IMG_6979.webp', 'imeges/zapretnaya-dver/2.webp', 'imeges/zapretnaya-dver/3.webp'], 
    loc: 'м. Измайловская',
    prices: {
      'Рабочие': 4990,
      'Выходные': 6990
    }
  },
  { 
    name: 'Изнанка в разуме Векны', 
    price: 5990, 
    time: '80 мин', 
    players: '1–6', 
    difficulty: '5/5', 
    photos: ['imeges/iznananka/Изнанка.webp'], 
    loc: 'м. Измайловская',
    prices: {
      '09:00-11:30': 5990,
      '12:45-21:30': 7500
    }
  },
  { 
    name: 'Among Us', 
    price: 7990, 
    time: '60 мин', 
    players: '6–10', 
    difficulty: '4/5', 
    photos: ['imeges/amongus/1.webp'], 
    loc: 'м. Измайловская',
    minPlayers: 6,
    prices: { 'Всегда': 7990 }
  },
  { 
    name: 'Невеста', 
    price: 5500, 
    time: '60 мин', 
    players: '1–6', 
    difficulty: '4/5', 
    photos: ['imeges/nevesta/1.webp', 'imeges/nevesta/2.webp', 'imeges/nevesta/3.webp'], 
    loc: 'м. Таганская',
    prices: {
      '09:00-10:15': 5500,
      '11:30-01:15': 7500
    }
  },
  { 
    name: 'Хогвартс', 
    price: 5500, 
    time: '60 мин', 
    players: '1–7', 
    difficulty: '3/5', 
    photos: ['imeges/rozhdestvo-v-hogvartse/1.webp', 'imeges/rozhdestvo-v-hogvartse/2.webp'], 
    loc: 'м. Таганская',
    prices: {
      '09:00-10:15': 5500,
      '11:30-22:45': 7500
    }
  },
  { 
    name: 'Лабубу: волшебный мир', 
    price: 5500, 
    time: '50 мин', 
    players: '1–8', 
    difficulty: '2/5', 
    photos: ['imeges/labubu/1.webp', 'imeges/labubu/2.webp', 'imeges/labubu/3.webp'], 
    loc: 'м. Таганская',
    prices: {
      '11:30-17:45': 7500,
      '19:00-10:15': 5500
    }
  },
  { 
    name: 'Монастырь', 
    price: 5990, 
    time: '70 мин', 
    players: '1–6', 
    difficulty: '5/5', 
    photos: ['imeges/monastyr/1.webp', 'imeges/monastyr/2.webp', 'imeges/monastyr/3.webp', 'imeges/monastyr/4.webp'], 
    loc: 'м. Таганская',
    prices: {
      '09:00-11:30': 5990,
      '12:45-01:15': 7500
    }
  },
  { 
    name: 'Гринч', 
    price: 5500, 
    time: '55 мин', 
    players: '1–8', 
    difficulty: '2/5', 
    photos: ['imeges/grinch/1.webp'], 
    loc: 'м. Таганская',
    prices: {
      '09:00-10:15': 5500,
      '11:30-22:45': 7500
    }
  },
  { 
    name: 'Хоррор-вечер', 
    price: 5500, 
    time: '60-90 мин', 
    players: '1–8', 
    difficulty: '4/5', 
    photos: ['https://downloader.disk.yandex.ru/preview/c66b427a33a69046e559d0134aea071ba28c0a9b705d8a133be18c7b1a00116d/6a558eca/qsU0Bl5d12t3jwWIpbhRRtSAdx0Gx-X5giQo3-ooRzYP3r2_Pw_LB4JERXIkF4EEryVtCtmGKl15FYrPmHFkcw%3D%3D?uid=0&filename=DSC01283_mk.jpg&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v3&is_direct_zip_experiment=1&size=1918x920'], 
    loc: 'м. Таганская',
    prices: {
      '09:00-10:15': 5500,
      '11:30-01:15': 7500
    }
  }
];

// ============================================================
// ===== ФОТО ДЛЯ ПАКЕТОВ =====
// ============================================================
const packagePhotos = {
  'Пакет на 2 часа': ['imeges/birthday/1.webp', 'imeges/labubu/1.webp', 'imeges/rozhdestvo-v-hogvartse/1.webp'],
  'Пакет на 3 часа': ['imeges/birthday/1.webp', 'imeges/nevesta/3.webp', 'imeges/rick-and-morty/4.webp', 'imeges/labubu/2.webp'],
  'Пакет на 4.5 часа': ['imeges/k-pop/1.webp', 'imeges/labubu/3.webp', 'imeges/monastyr/4.webp', 'imeges/rick-and-morty/2.webp', 'imeges/horror-svidanie/1.webp', 'imeges/amongus/1.webp']
};

// ============================================================
// ===== ВРЕМЕННЫЕ СЛОТЫ =====
// ============================================================
const questTimes = {
  'Among Us': ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30'],
  'K-pop: последний стрим': ['00:15', '01:30', '09:15', '10:30', '11:45', '13:00', '14:15', '15:30', '16:45', '18:00', '19:15', '20:30', '21:45', '23:00'],
  'Гринч': ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30', '22:45'],
  'Запретная дверь': ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30'],
  'Изнанка в разуме Векны': ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30'],
  'Лабубу: волшебный мир': ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30'],
  'Монастырь': ['00:00', '01:15', '09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30', '22:45'],
  'Невеста': ['00:00', '01:15', '09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30', '22:45'],
  'Хогвартс': ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30', '22:45'],
  'Рик и Морти': ['00:00', '01:15', '09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30', '22:45'],
  'Стоматология "Новая жизнь"': ['00:00', '01:15', '09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30', '22:45'],
  'Хоррор-свидание': ['00:00', '01:15', '09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30', '22:45'],
  'Хоррор-вечер': ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30', '22:45']
};

// ============================================================
// ===== ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ (ДЛЯ КВЕСТОВ) =====
// ============================================================
const additionalServices = [
  { id: 'video', name: 'Видеонарезка', price: 4000, icon: '🎥', desc: '5-7 минут ярких моментов вашего приключения.' },
  { id: 'director', name: 'Кресло режиссёра', price: 2000, icon: '🎬', desc: 'Наблюдение за игрой со стороны.' },
  { id: 'actor', name: 'Доп. актёр', price: 2000, icon: '🎭', desc: 'Может уменьшить или увеличить уровень страха.' },
  { id: 'loft', name: 'Лофт', price: 5500, icon: '🏠', desc: 'Украшенный шарами и засервированный одноразовой посудой.' },
  { id: 'board_game', name: 'Настольная игра', price: 8000, icon: '🎲', desc: 'С ведущим после квеста.' },
  { id: 'congrats', name: 'Креатив', price: 2000, icon: '🎉', desc: 'Креативное поздравление для именинника.' },
  { id: 'photographer', name: 'Фотограф', price: 4000, icon: '📸', desc: 'После квеста, все исходники и 10 фото в проф. обработке.' }
];

// ============================================================
// ===== ОПЦИИ ДЛЯ ПАКЕТОВ =====
// ============================================================
const packageOptions = [
  { id: 'video', name: 'Видеонарезка', price: 4000, icon: '🎥', desc: '5-7 минут ярких моментов вашего приключения.' },
  { id: 'director', name: 'Кресло режиссёра', price: 2000, icon: '🎬', desc: 'Наблюдение за игрой со стороны.' },
  { id: 'actor', name: 'Доп. актёр', price: 2000, icon: '🎭', desc: 'Может уменьшить или увеличить уровень страха.' },
  { id: 'loft', name: 'Лофт', price: 5500, icon: '🏠', desc: 'Украшенный шарами и засервированный одноразовой посудой.' },
  { id: 'board_game', name: 'Настольная игра', price: 8000, icon: '🎲', desc: 'С ведущим после квеста.' },
  { id: 'congrats', name: 'Креатив', price: 2000, icon: '🎉', desc: 'Креативное поздравление для именинника.' },
  { id: 'photographer', name: 'Фотограф', price: 4000, icon: '📸', desc: 'После квеста, все исходники и 10 фото в проф. обработке.' },
  { id: 'balloon', name: 'Шар с цифрой', price: 1000, icon: '🎈', desc: 'Красивый шар с цифрой для именинника.' },
  { id: 'aquagrim', name: 'Аквагрим/Блеск-тату', price: 7000, icon: '🎨', desc: 'Аквагрим или блеск-тату (или бьюти-бар за 8000).' },
  { id: 'candy_bar', name: 'Кенди-бар', price: 9000, icon: '🍭', desc: 'Сладкий стол для вашего праздника.' },
  { id: 'pinata', name: 'Пиньята', price: 6000, icon: '🎊', desc: 'С любым дизайном на ваш выбор.' },
  { id: 'paper_disco', name: 'Бумажная дискотека', price: 12000, icon: '🪩', desc: 'Яркое шоу с бумажным конфетти.' },
  { id: 'wish_ball', name: 'Шар желаний', price: 3000, icon: '🌟', desc: 'Загадайте желание в красивом шаре.' },
  { id: 'show_program', name: 'Шоу-программа', price: 12000, icon: '🎪', desc: 'Крио-шоу или шоу хоррор-фокусов.' },
  { id: 'trash_box', name: 'Треш-коробка', price: 8000, icon: '📦', desc: 'Коробка с сюрпризами для именинника.' },
  { id: 'videographer', name: 'Видеограф', price: 6000, icon: '🎥', desc: 'Профессиональная видеосъёмка всего мероприятия.' },
  { id: 'master_class', name: 'Мастер-класс', price: 10000, icon: '🎨', desc: 'Роспись шоперов или создание коктейлей.' }
];

// ============================================================
// ===== ОПЦИИ ДЛЯ РАЗНЫХ ТИПОВ БРОНИРОВАНИЯ =====
// ============================================================
const bookingOptions = {
  default: additionalServices,
  amongus: [
    { id: 'extra_round', name: 'Дополнительный раунд', price: 2000, icon: '🔄', desc: 'Добавьте ещё один раунд игры для большего адреналина!' },
    { id: 'costumes', name: 'Костюмы персонажей', price: 1500, icon: '👽', desc: 'Наденьте костюмы персонажей Among Us для полного погружения.' },
    { id: 'host', name: 'Специальный ведущий', price: 2500, icon: '🎙️', desc: 'Профессиональный ведущий, который будет управлять игрой.' },
    { id: 'photo', name: 'Фотосессия', price: 2000, icon: '📸', desc: 'Профессиональная фотосессия в костюмах Among Us.' },
    { id: 'video', name: 'Видеонарезка', price: 4000, icon: '🎥', desc: 'Динамичная видео-нарезка с самыми яркими моментами игры.' }
  ],
  horror: [
    { id: 'fear_level', name: 'Повышенный уровень страха', price: 2000, icon: '😱', desc: 'Увеличьте уровень страха — более интенсивные эффекты.' },
    { id: 'extra_actor', name: 'Дополнительный актёр', price: 2000, icon: '🎭', desc: 'Может уменьшить или увеличить уровень страха.' },
    { id: 'video', name: 'Видеонарезка', price: 4000, icon: '🎥', desc: '5-7 минут ярких моментов вашего приключения.' },
    { id: 'romantic_dinner', name: 'Романтический ужин', price: 3500, icon: '🍷', desc: 'Уютный ужин при свечах после прохождения квеста.' },
    { id: 'photographer', name: 'Фотограф', price: 4000, icon: '📸', desc: 'После квеста, все исходники и 10 фото в проф. обработке.' }
  ],
  events: [
    { id: 'out_of_mkad', name: 'Выезд за МКАД', price: 3000, icon: '🚗', desc: 'Доплата за выезд за пределы МКАД.' },
    { id: 'extra_actor', name: 'Дополнительный актёр', price: 2000, icon: '🎭', desc: 'Может уменьшить или увеличить уровень страха.' },
    { id: 'video', name: 'Видеонарезка', price: 4000, icon: '🎥', desc: '5-7 минут ярких моментов вашего приключения.' },
    { id: 'photographer', name: 'Фотограф', price: 4000, icon: '📸', desc: 'После квеста, все исходники и 10 фото в проф. обработке.' },
    { id: 'decor', name: 'Декор помещения', price: 3500, icon: '🎈', desc: 'Тематическое украшение помещения для вашего праздника.' }
  ],
  package: packageOptions
};

// ============================================================
// ===== АДРЕСА ЛОКАЦИЙ =====
// ============================================================
function getLocationAddress(location) {
  const addresses = {
    'м. Профсоюзная': 'ул. Кржижановского, 8, корп. 2',
    'м. Таганская': 'Большой Факельный пер., 2/22',
    'м. Измайловская': 'ул. Первомайская, 5',
    'Профсоюзная': 'ул. Кржижановского, 8, корп. 2',
    'Таганская': 'Большой Факельный пер., 2/22',
    'Измайловская': 'ул. Первомайская, 5'
  };
  return addresses[location] || 'Москва';
}

function getMapUrl(location) {
  const maps = {
    'м. Профсоюзная': 'https://yandex.ru/map-widget/v1/?ll=37.563116%2C55.681585&mode=search&text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB.%20%D0%9A%D1%80%D0%B6%D0%B8%D0%B6%D0%B0%D0%BD%D0%BE%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE%2C%208%2C%20%D0%BA%D0%BE%D1%80%D0%BF.%202&z=17',
    'Профсоюзная': 'https://yandex.ru/map-widget/v1/?ll=37.563116%2C55.681585&mode=search&text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB.%20%D0%9A%D1%80%D0%B6%D0%B8%D0%B6%D0%B0%D0%BD%D0%BE%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE%2C%208%2C%20%D0%BA%D0%BE%D1%80%D0%BF.%202&z=17',
    'м. Таганская': 'https://yandex.ru/map-widget/v1/?ll=37.661444%2C55.743230&mode=search&text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%91%D0%BE%D0%BB%D1%8C%D1%88%D0%BE%D0%B9%20%D0%A4%D0%B0%D0%BA%D0%B5%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%D0%BF%D0%B5%D1%80.%2C%202%2F22&z=17',
    'Таганская': 'https://yandex.ru/map-widget/v1/?ll=37.661444%2C55.743230&mode=search&text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%91%D0%BE%D0%BB%D1%8C%D1%88%D0%BE%D0%B9%20%D0%A4%D0%B0%D0%BA%D0%B5%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%D0%BF%D0%B5%D1%80.%2C%202%2F22&z=17',
    'м. Измайловская': 'https://yandex.ru/map-widget/v1/?ll=37.773053%2C55.791071&mode=search&text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB.%20%D0%9F%D0%B5%D1%80%D0%B2%D0%BE%D0%BC%D0%B0%D0%B9%D1%81%D0%BA%D0%B0%D1%8F%2C%205&z=17',
    'Измайловская': 'https://yandex.ru/map-widget/v1/?ll=37.773053%2C55.791071&mode=search&text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB.%20%D0%9F%D0%B5%D1%80%D0%B2%D0%BE%D0%BC%D0%B0%D0%B9%D1%81%D0%BA%D0%B0%D1%8F%2C%205&z=17'
  };
  return maps[location] || maps['м. Профсоюзная'];
}

// ============================================================
// ===== ПОЛУЧЕНИЕ ЦЕНЫ ПО ВРЕМЕНИ =====
// ============================================================
function getPriceByTime(questName, timeSlot) {
  const apiPrice = externalBookingApi()?.getSlot(questName, selectedDateKey(), timeSlot)?.price;
  if (apiPrice) return apiPrice;
  const quest = questsData.find(q => q.name === questName);
  if (!quest || !quest.prices) return quest ? quest.price : 0;
  
  const prices = quest.prices;
  
  if (questName === 'Запретная дверь') {
    const day = selectedDate ? selectedDate.getDay() : new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    return isWeekend ? prices['Выходные'] : prices['Рабочие'];
  }
  
  if (questName === 'Among Us') {
    return prices['Всегда'] || 7990;
  }
  
  // Поиск по диапазонам времени
  for (const [range, price] of Object.entries(prices)) {
    if (range.includes('-')) {
      const [start, end] = range.split('-');
      if (start <= end) {
        // Обычный диапазон в пределах одних суток
        if (timeSlot >= start && timeSlot <= end) {
          return price;
        }
      } else {
        // Диапазон переходит через полночь (например '19:00-10:15')
        if (timeSlot >= start || timeSlot <= end) {
          return price;
        }
      }
    } else if (range === timeSlot) {
      return price;
    }
  }
  
  return quest.price || 0;
}

function getBookingType(name) {
  if (name.includes('Пакет') || name.includes('Свой пакет')) {
    return 'package';
  }
  if (name === 'Among Us') {
    return 'amongus';
  }
  if (name.includes('Хоррор') || name.includes('свидание') || name.includes('вечер')) {
    return 'horror';
  }
  if (name.includes('Выездное') || name.includes('Домашний') || name.includes('Корпоратив') || name.includes('Природа')) {
    return 'events';
  }
  return 'default';
}

function getOptionsByType(type) {
  switch(type) {
    case 'package': return bookingOptions.package;
    case 'amongus': return bookingOptions.amongus;
    case 'horror': return bookingOptions.horror;
    case 'events': return bookingOptions.events;
    default: return bookingOptions.default;
  }
}

function getQuestPhotos(questName) {
  if (questName.includes('Пакет') || questName.includes('Свой пакет')) {
    for (const [key, photos] of Object.entries(packagePhotos)) {
      if (questName.includes(key)) return photos;
    }
    return ['imeges/birthday/1.webp', 'imeges/labubu/1.webp', 'imeges/rozhdestvo-v-hogvartse/1.webp'];
  }
  const quest = questsData.find(q => q.name === questName);
  return quest && quest.photos ? quest.photos : ['imeges/nevesta/1.webp', 'imeges/rozhdestvo-v-hogvartse/1.webp', 'imeges/rick-and-morty/1.webp'];
}

function showToast(msg, duration) {
  const t = document.getElementById('toast');
  if (!t) {
    console.log('Toast:', msg);
    return;
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration || 2800);
}

function openOfficialBookingWidget(url) {
  let overlay = document.getElementById('officialBookingWidget');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'officialBookingWidget';
    overlay.className = 'official-booking-widget';
    overlay.innerHTML = '<div class="official-widget-backdrop"></div><section><button type="button" aria-label="Закрыть">×</button><iframe title="Официальное бронирование my-ERP"></iframe></section>';
    document.body.appendChild(overlay);
    const close = () => overlay.hidden = true;
    overlay.querySelector('button').addEventListener('click', close);
    overlay.querySelector('.official-widget-backdrop').addEventListener('click', close);
  }
  overlay.querySelector('iframe').src = url;
  overlay.hidden = false;
}

function formatMoney(amount) {
  return `${Math.round(Number(amount) || 0)} ₽`;
}

function isCurrentPackageBooking() {
  return isPackageBooking || getBookingType(currentBookingName) === 'package';
}

function getSelectedPackageQuest() {
  const select = document.getElementById('packageQuestChoice');
  if (!select || !isCurrentPackageBooking()) return '';
  return select.value || '';
}

function getScheduleQuestName() {
  return getSelectedPackageQuest() || currentBookingName;
}

function isCustomPackageBooking() {
  return isCurrentPackageBooking() && currentBookingName.includes('Свой пакет');
}

function getBasePriceForBooking(activeTime) {
  if (isCurrentPackageBooking()) {
    return (currentBookingPrice || 0) + (isCustomPackageBooking() ? getSelectedPackageQuestPrice(activeTime) : 0);
  }

  if (activeTime && currentBookingName) {
    const time = activeTime.querySelector('.slot-time')?.textContent;
    const priceByTime = getPriceByTime(currentBookingName, time);
    if (priceByTime) {
      currentBookingPrice = priceByTime;
      return priceByTime;
    }
  }

  const quest = questsData.find(q => q.name === currentBookingName);
  if (quest) {
    currentBookingPrice = quest.price;
    return quest.price;
  }

  return currentBookingPrice || 0;
}

function getSelectedPackageQuestPrice(activeTime) {
  const packageQuest = getSelectedPackageQuest();
  if (!packageQuest || !activeTime) return 0;
  const time = activeTime.querySelector('.slot-time')?.textContent || selectedTime;
  return getPriceByTime(packageQuest, time) || 0;
}

function getPackageParticipantRule() {
  if (!isCurrentPackageBooking()) return null;
  if (currentBookingName.includes('4.5')) {
    return { basePlayers: 5, extraPlayerPrice: 2500 };
  }
  return { basePlayers: 3, extraPlayerPrice: 1500 };
}

function getParticipantRule() {
  return getPackageParticipantRule() || { basePlayers: 3, extraPlayerPrice: 1500 };
}

function calculateBookingTotals() {
  const playersEl = document.getElementById('bookingPlayersDisplay');
  const players = parseInt(playersEl ? playersEl.textContent : bookingPlayersValue) || 1;
  const activeTime = document.querySelector('.time-slot.active');
  const selectedOptions = document.querySelectorAll('.option-checkbox:checked');
  const basePrice = getBasePriceForBooking(activeTime);

  let optionTotal = 0;
  selectedOptions.forEach(el => {
    optionTotal += parseInt(el.dataset.price || 0);
  });

  const participantRule = getParticipantRule();
  const basePlayers = participantRule.basePlayers;
  const extraPlayerPrice = participantRule.extraPlayerPrice;
  const extraPlayerCost = players > basePlayers ? (players - basePlayers) * extraPlayerPrice : 0;
  const subtotal = basePrice + optionTotal + extraPlayerCost;
  const discount = promoApplied && isSelectedBookingWeekday() ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const packageQuestPrice = isCustomPackageBooking() ? getSelectedPackageQuestPrice(activeTime) : 0;
  const packageServicePrice = isCurrentPackageBooking() ? (currentBookingPrice || 0) : basePrice;

  return { players, activeTime, basePrice, packageServicePrice, packageQuestPrice, optionTotal, extraPlayerCost, basePlayers, extraPlayerPrice, subtotal, discount, total, deposit: 1500 };
}

function getBasePriceLabel(totals) {
  const priceType = isCurrentPackageBooking() ? 'Цена пакета' : 'Цена квеста';
  const playersText = totals.basePlayers === 5 ? 'до 5х' : `за ${totals.basePlayers}х`;
  return `${priceType} ${playersText}:`;
}

function updateParticipantExtraDisplay(totals) {
  const extraDisplay = document.getElementById('bookingPlayersExtra');
  if (!extraDisplay) return;

  if (totals.extraPlayerCost > 0) {
    extraDisplay.textContent = `+${formatMoney(totals.extraPlayerPrice)}`;
    extraDisplay.classList.add('visible');
  } else {
    extraDisplay.textContent = '';
    extraDisplay.classList.remove('visible');
  }
}

function getSelectedDateDisplay() {
  const activeDate = document.querySelector('.date-grid .date-cell.active');
  if (!activeDate) return 'Не выбрана';

  const parts = activeDate.dataset.date.split('-');
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function updatePaymentStep(totals) {
  const activeTime = totals.activeTime;
  const time = activeTime ? activeTime.querySelector('.slot-time').textContent : '—';
  const rest = Math.max(totals.total - totals.deposit, 0);

  const paymentQuest = document.getElementById('paymentQuest');
  const paymentDateTime = document.getElementById('paymentDateTime');
  const paymentDepositAmount = document.getElementById('paymentDepositAmount');
  const paymentTotal = document.getElementById('paymentTotal');
  const paymentRest = document.getElementById('paymentRest');

  if (paymentQuest) paymentQuest.textContent = currentBookingName;
  if (paymentDateTime) paymentDateTime.textContent = `${getSelectedDateDisplay()}, ${time}`;
  if (paymentDepositAmount) paymentDepositAmount.textContent = formatMoney(totals.deposit);
  if (paymentTotal) paymentTotal.textContent = formatMoney(totals.total);
  if (paymentRest) paymentRest.textContent = formatMoney(rest);
}

function renderTotalAmount(el, subtotal, total, discount) {
  if (!el) return;
  if (discount > 0) {
    el.classList.add('has-discount');
    el.innerHTML = `<span class="booking-total-old">${formatMoney(subtotal)}</span><span class="booking-total-current">${formatMoney(total)}</span>`;
  } else {
    el.classList.remove('has-discount');
    el.textContent = formatMoney(total);
  }
}

function ensurePackageQuestSelect() {
  let wrapper = document.getElementById('packageQuestSelect');
  let select = document.getElementById('packageQuestChoice');
  const timeGrid = document.getElementById('timeGrid');
  const form = timeGrid ? timeGrid.closest('.booking-form') : null;
  const quantityBlock = form ? form.querySelector('.quantity-control')?.parentElement : null;

  if (!wrapper && form) {
    wrapper = document.createElement('div');
    wrapper.className = 'quest-select-wrapper';
    wrapper.id = 'packageQuestSelect';
    wrapper.style.display = 'none';
    wrapper.innerHTML = `
      <label>Квест внутри пакета</label>
      <select id="packageQuestChoice"></select>
      <div class="field-hint">В готовом пакете квест входит в стоимость. В пакете с нуля цена квеста добавится по выбранному слоту.</div>
    `;
    form.insertBefore(wrapper, quantityBlock || form.querySelector('.btn-group') || null);
    select = wrapper.querySelector('#packageQuestChoice');
  }

  if (!select) return;

  const currentValue = select.value || '';
  select.innerHTML = '<option value="">Без выбора квеста</option>' + questsData
    .map(q => `<option value="${escapeAttr(q.name)}">${q.name}</option>`)
    .join('');
  select.value = questsData.some(q => q.name === currentValue) ? currentValue : '';
}

function ensurePromoField() {
  if (document.getElementById('promoInput')) return;

  const methods = document.getElementById('contactMethods');
  const form = methods ? methods.closest('.booking-form') : null;
  const comment = document.getElementById('bookingComment');
  if (!form) return;

  const block = document.createElement('div');
  block.className = 'promo-field';
  block.innerHTML = `
    <label>Промокод</label>
    <div class="promo-field-row">
      <input type="text" id="promoInput" placeholder="Введите промокод" />
      <button type="button" id="applyPromoBtn" class="btn-book-sm">Применить</button>
    </div>
    <div id="promoStatus" class="promo-status"></div>
  `;

  if (comment) {
    const commentLabel = Array.from(form.querySelectorAll('label')).find(label => label.nextElementSibling === comment);
    form.insertBefore(block, commentLabel || comment);
  } else {
    form.appendChild(block);
  }
}

function ensureBookingUi() {
  ensurePackageQuestSelect();
  ensurePromoField();
  ensurePackagesCollapsible();
  initPackagesCollapsible();
}

function ensurePackagesCollapsible() {
  if (document.getElementById('packagesCollapsible')) return;

  const step2 = document.querySelector('.step-content[data-step="2"]');
  const summary = step2 ? step2.querySelector('.booking-summary-card') : null;
  const btnGroup = step2 ? step2.querySelector('.btn-group') : null;
  if (!step2) return;

  const block = document.createElement('div');
  block.className = 'packages-collapsible';
  block.id = 'packagesCollapsible';
  block.innerHTML = `
    <div class="collapsible-header" id="packagesToggle">
      <span>🎁 Выбрать готовый пакет</span>
      <span class="arrow" id="packagesArrow">▼</span>
    </div>
    <div class="collapsible-body" id="packagesBody">
      <div class="package-mini" data-package="Пакет на 2 часа" data-price="23500" data-base-players="3" data-extra-player-price="1500">
        <span class="pkg-name">Пакет на 2 часа</span>
        <span class="pkg-price">23 500 ₽ <small>за 3х, доп. 1 500 ₽; квест входит</small></span>
        <button type="button" class="package-desc-toggle" aria-expanded="false">Состав пакета</button>
        <div class="package-description"><ul><li>Квест/анимационная программа на выбор</li><li>Дополнительный актёр</li><li>Украшенная лофт зона</li><li>Сервировка стола</li><li>Креативное поздравление</li><li>Треш коробка</li></ul></div>
      </div>
      <div class="package-mini" data-package="Пакет на 3 часа" data-price="39000" data-base-players="3" data-extra-player-price="1500">
        <span class="pkg-name">⭐ Пакет на 3 часа</span>
        <span class="pkg-price">39 000 ₽ <small>за 3х, доп. 1 500 ₽; квест входит</small></span>
        <span class="pkg-badge">Популярный</span>
        <button type="button" class="package-desc-toggle" aria-expanded="false">Состав пакета</button>
        <div class="package-description"><ul><li>Всё из пакета на 2 часа</li><li>Памятный подарок имениннику и сувенир каждому участнику</li><li>Фотограф</li><li>10 фото в проф. обработке и цветокоррекции</li><li>Кресло режиссёра</li><li>Видео-нарезка самых ярких моментов с прохождения квеста</li><li>Настольная игра с ведущим на выбор</li></ul></div>
      </div>
      <div class="package-mini" data-package="Пакет на 4.5 часа" data-price="103000" data-base-players="5" data-extra-player-price="2500">
        <span class="pkg-name">Пакет на 4.5 часа</span>
        <span class="pkg-price">103 000 ₽ <small>до 5х, доп. 2 500 ₽; квест входит</small></span>
        <button type="button" class="package-desc-toggle" aria-expanded="false">Состав пакета</button>
        <div class="package-description"><ul><li>Всё из пакета на 3 часа</li><li>Перекрытие локации на всё время праздника</li><li>Лофт зона</li><li>Персональные украшения</li><li>Фотограф на время квеста в образе</li><li>15 фото в проф. обработке + видео с квеста</li><li>Велком дринк или Кенди бар</li><li>Шоу программа на выбор: Крио шоу или шоу Фокусов</li><li>Аквагрим или Блеск тату</li><li>Шар с цифрой</li><li>Мастер-класс на выбор</li><li>Пиньята с любым дизайном</li><li>Персональный менеджер</li><li>Настольная игра с ведущим или музыкальные конкурсы или квиз об имениннике</li><li>Развлечения для родителей: мафия с ведущим или Кресло режиссёра</li><li>Бумажная дискотека с боем подушками или Танцевальные конкурсы</li></ul></div>
      </div>
    </div>
  `;

  step2.insertBefore(block, btnGroup || (summary ? summary.nextSibling : null));
}

function initPackagesCollapsible() {
  const toggle = document.getElementById('packagesToggle');
  const body = document.getElementById('packagesBody');
  const arrow = document.getElementById('packagesArrow');

  if (toggle && body && !toggle.dataset.initialized) {
    toggle.dataset.initialized = '1';
    toggle.addEventListener('click', function() {
      body.classList.toggle('open');
      if (arrow) arrow.classList.toggle('open');
    });
  }

  document.querySelectorAll('.package-mini').forEach(item => {
    if (item.dataset.initialized) return;
    item.dataset.initialized = '1';
    item.addEventListener('click', function() {
      const packageName = this.dataset.package || 'Пакет';
      const packagePrice = parseInt(this.dataset.price || 0, 10);
      selectReadyPackage(packageName, packagePrice, this);
    });

    const descriptionToggle = item.querySelector('.package-desc-toggle');
    const description = item.querySelector('.package-description');
    if (descriptionToggle && description) {
      descriptionToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        const isOpen = description.classList.toggle('open');
        this.setAttribute('aria-expanded', String(isOpen));
        this.textContent = isOpen ? 'Скрыть состав' : 'Состав пакета';
      });
    }
  });
}

function selectReadyPackage(packageName, packagePrice, activeItem) {
  isPackageBooking = true;
  selectedPackageQuest = '';
  currentBookingName = packageName;
  currentBookingDesc = `Готовый пакет "${packageName}" с максимальной выгодой.`;
  currentBookingPrice = packagePrice || 0;

  document.querySelectorAll('.package-mini').forEach(item => {
    item.classList.toggle('active', item === activeItem || item.dataset.package === packageName);
  });

  const title = document.getElementById('bookQuestName');
  const desc = document.getElementById('bookQuestDesc');
  const metaTime = document.getElementById('bookQuestMetaTime');
  const metaPlayers = document.getElementById('bookQuestMetaPlayers');
  const metaDifficulty = document.getElementById('bookQuestMetaDifficulty');
  if (title) title.textContent = packageName;
  if (desc) desc.textContent = currentBookingDesc;
  if (metaTime) metaTime.textContent = currentBookingName.includes('4.5') ? '4.5 часа' : currentBookingName.includes('3') ? '3 часа' : '2 часа';
  if (metaPlayers) metaPlayers.textContent = currentBookingName.includes('4.5') ? 'до 5 включено' : '3 включено';
  if (metaDifficulty) metaDifficulty.textContent = 'по выбору';

  const packageQuestSelect = document.getElementById('packageQuestSelect');
  const packageChoice = document.getElementById('packageQuestChoice');
  if (packageQuestSelect) packageQuestSelect.style.display = 'block';
  if (packageChoice) packageChoice.value = '';

  document.querySelectorAll('.option-checkbox').forEach(cb => {
    cb.checked = false;
    cb.closest('.option-card')?.classList.remove('active');
  });
  setPackageOptionsVisibility(false);
  updateBookingPhotos(packageName);
  updateTotalDisplay();
  updateReceipt();
}

function setPackageOptionsVisibility(visible) {
  const optionsGrid = document.getElementById('optionsGrid');
  const optionsTitle = document.querySelector('.step-content[data-step="2"] h3');
  if (optionsGrid) {
    optionsGrid.innerHTML = '';
    optionsGrid.style.display = visible ? 'grid' : 'none';
  }
  if (optionsTitle) optionsTitle.style.display = visible ? 'block' : 'none';
}

// ============================================================
// ===== ОБНОВЛЕНИЕ ФОТО =====
// ============================================================
function updateBookingPhotos(questName) {
  const photos = getQuestPhotos(questName);
  const track = document.getElementById('bookingPhotosTrack');
  const dotsContainer = document.getElementById('bookingPhotosDots');
  
  if (!track || !dotsContainer) return;
  
  track.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  const labels = ['Атмосфера', 'Интерьер', 'Эмоции'];
  photos.forEach((photo, index) => {
    const slide = document.createElement('div');
    slide.className = 'booking-photos-slide';
    const isImage = /\.(jpe?g|png|webp|gif|avif)$/i.test(photo);
    slide.innerHTML = `
      <div class="booking-photo-frame">
        ${isImage ? `<img src="${photo}" alt="${labels[index] || 'Фото ' + (index + 1)}" loading="lazy">` : `<div class="booking-photo-fallback">${photo}</div>`}
        <div class="slide-label">${labels[index] || 'Фото ' + (index + 1)}</div>
      </div>
    `;
    track.appendChild(slide);
    
    const dot = document.createElement('button');
    dot.className = 'booking-photos-dot' + (index === 0 ? ' active' : '');
    dot.dataset.index = index;
    dot.addEventListener('click', function() {
      goToBookingPhoto(parseInt(this.dataset.index));
    });
    dotsContainer.appendChild(dot);
  });
  
  currentBookingPhotoIndex = 0;
  updateBookingPhotoPosition();
}

let currentBookingPhotoIndex = 0;

function goToBookingPhoto(index) {
  const slides = document.querySelectorAll('.booking-photos-slide');
  const dots = document.querySelectorAll('.booking-photos-dot');
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  currentBookingPhotoIndex = index;
  updateBookingPhotoPosition();
}

function updateBookingPhotoPosition() {
  const track = document.getElementById('bookingPhotosTrack');
  const dots = document.querySelectorAll('.booking-photos-dot');
  if (!track) return;
  track.style.transform = `translateX(-${currentBookingPhotoIndex * 100}%)`;
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentBookingPhotoIndex);
  });
}

// ============================================================
// ===== ОСНОВНАЯ ФУНКЦИЯ: ОБНОВЛЕНИЕ ИТОГОВОЙ СУММЫ =====
// ============================================================
function updateTotalDisplay() {
  const totals = calculateBookingTotals();
  const basePriceLabel = getBasePriceLabel(totals);
  
  // === ОБНОВЛЯЕМ ОТОБРАЖЕНИЕ ===
  // Шаг 1
  renderTotalAmount(document.getElementById('bookingTotalDisplay'), totals.subtotal, totals.total, totals.discount);
  
  // Шаг 2
  renderTotalAmount(document.getElementById('bookingTotalDisplayStep2'), totals.subtotal, totals.total, totals.discount);
  
  // Шаг 3
  renderTotalAmount(document.getElementById('bookingTotalDisplayStep3'), totals.subtotal, totals.total, totals.discount);
  
  // Шаг 4
  renderTotalAmount(document.getElementById('bookingTotalDisplayStep4'), totals.subtotal, totals.total, totals.discount);

  // Шаг 5
  renderTotalAmount(document.getElementById('bookingTotalDisplayStep5'), totals.subtotal, totals.total, totals.discount);
  
  // Цена базовой услуги без промокода. Скидка видна в блоке "Итого к оплате".
  updateParticipantExtraDisplay(totals);

  ['bookingPriceLabel', 'bookingPriceLabel2', 'bookingPriceLabel3', 'bookingPriceLabel4', 'bookingPriceLabel5'].forEach(id => {
    const label = document.getElementById(id);
    if (label) {
      label.textContent = basePriceLabel;
    }
  });

  const priceDisplay = document.getElementById('bookingPriceDisplay');
  if (priceDisplay) {
    priceDisplay.textContent = totals.basePrice;
  }
  
  const priceDisplay2 = document.getElementById('bookingPriceDisplay2');
  if (priceDisplay2) {
    priceDisplay2.textContent = totals.basePrice;
  }
  const priceDisplay3 = document.getElementById('bookingPriceDisplay3');
  if (priceDisplay3) {
    priceDisplay3.textContent = totals.basePrice;
  }
  
  const priceDisplay4 = document.getElementById('bookingPriceDisplay4');
  if (priceDisplay4) {
    priceDisplay4.textContent = totals.basePrice;
  }

  const priceDisplay5 = document.getElementById('bookingPriceDisplay5');
  if (priceDisplay5) {
    priceDisplay5.textContent = totals.basePrice;
  }
  
  const depositDisplay = document.getElementById('bookingDepositDisplay');
  if (depositDisplay) {
    depositDisplay.textContent = formatMoney(totals.deposit);
  }
  
  const depositDisplay2 = document.getElementById('bookingDepositDisplay2');
  if (depositDisplay2) {
    depositDisplay2.textContent = formatMoney(totals.deposit);
  }
  
  const depositDisplay3 = document.getElementById('bookingDepositDisplay3');
  if (depositDisplay3) {
    depositDisplay3.textContent = formatMoney(totals.deposit);
  }
  
  const depositDisplay4 = document.getElementById('bookingDepositDisplay4');
  if (depositDisplay4) {
    depositDisplay4.textContent = formatMoney(totals.deposit);
  }

  const depositDisplay5 = document.getElementById('bookingDepositDisplay5');
  if (depositDisplay5) {
    depositDisplay5.textContent = formatMoney(totals.deposit);
  }

  updatePaymentStep(totals);
}



// ============================================================
// ===== ОТКРЫТИЕ / ЗАКРЫТИЕ БРОНИРОВАНИЯ =====
// ============================================================

function openBooking(name, desc, price, isPackage) {
  if (!document.body.classList.contains('standalone-booking-page')) {
    const bookingSelection = {
      name: name || 'Квест',
      desc: desc || '',
      price: Number(price) || 0,
      isPackage: Boolean(isPackage)
    };
    sessionStorage.setItem('immerscapeBookingSelection', JSON.stringify(bookingSelection));
    const params = new URLSearchParams({
      name: bookingSelection.name,
      desc: bookingSelection.desc,
      price: String(bookingSelection.price),
      package: bookingSelection.isPackage ? '1' : '0'
    });
    window.location.href = `booking.html?${params.toString()}`;
    return;
  }

  ensureBookingUi();
  resetBookingData();
  
  document.querySelectorAll('.page-overlay').forEach(el => el.classList.remove('open'));
  
  isPackageBooking = isPackage || false;
  selectedPackageQuest = '';
  currentBookingName = name;
  currentBookingDesc = desc || '';
  currentBookingPrice = price || 0;
  
  const overlay = document.getElementById('bookingOverlay');
  if (!overlay) return;
  
  document.getElementById('bookQuestName').textContent = name;
  document.getElementById('bookQuestDesc').textContent = desc || 'Погрузитесь в атмосферу приключения!';
  
  const quest = questsData.find(q => q.name === name);
  if (quest) {
    currentBookingPrice = quest.price;
  }
  
  const metaTime = document.getElementById('bookQuestMetaTime');
  const metaPlayers = document.getElementById('bookQuestMetaPlayers');
  const metaDifficulty = document.getElementById('bookQuestMetaDifficulty');
  if (metaTime) metaTime.textContent = quest ? quest.time : '60-90 мин';
  if (metaPlayers) metaPlayers.textContent = quest ? quest.players : '1–8';
  if (metaDifficulty) metaDifficulty.textContent = quest ? quest.difficulty : '—';
  
  updateBookingPhotos(name);
  
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear = now.getFullYear();
  selectedDate = new Date(today);
  selectedTime = null;
  
  renderCalendar(currentMonth, currentYear);
  const selectedDateEl = document.getElementById('selectedDate');
  if (selectedDateEl) {
    selectedDateEl.textContent = selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  generateTimeSlots(getCurrentQuestName());

  const api = externalBookingApi();
  if (api?.getConfig(name)) {
    api.load(name).then(() => {
      if (currentBookingName !== name) return;
      renderCalendar(currentMonth, currentYear);
      generateTimeSlots(getCurrentQuestName());
      updateTotalDisplay();
    });
  }
  
  const packageRule = isPackageBooking ? getPackageParticipantRule() : null;
  bookingPlayersValue = packageRule ? packageRule.basePlayers : ((quest && quest.minPlayers) || 1);
  document.getElementById('bookingPlayersDisplay').textContent = String(bookingPlayersValue);
  
  promoApplied = false;
  const promoInput = document.getElementById('promoInput');
  if (promoInput) promoInput.value = '';
  
  const bookingType = isPackageBooking ? 'package' : getBookingType(name);
  const isPackageBookingNow = isPackageBooking || bookingType === 'package';
  const optionsForType = getOptionsByType(bookingType);
  
  const optionsGrid = document.getElementById('optionsGrid');
  const packagesCollapsible = document.getElementById('packagesCollapsible');
  const packageQuestSelect = document.getElementById('packageQuestSelect');
  const optionsTitle = document.querySelector('.step-content[data-step="2"] h3');
  document.querySelectorAll('.package-mini').forEach(item => {
    item.classList.toggle('active', item.dataset.package === name);
  });
  
  let location = quest ? quest.loc : '';
  const address = getLocationAddress(location);
  const mapUrl = getMapUrl(location);
  
  const mapContainer = document.getElementById('bookingMap');
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div style="margin-top:12px; border-radius:12px; overflow:hidden; border:1px solid #2d2640;">
        <iframe 
          src="${mapUrl}" 
          width="100%" 
          height="200" 
          style="border:none; display:block;"
          allowfullscreen
          loading="lazy"
          title="Яндекс Карта: ${location}, ${address}"
        ></iframe>
        <div style="padding:8px 12px; background:#1a1625; font-size:0.75rem; color:#b0a8c8;">
          📍 ${location}: ${address}
        </div>
      </div>
    `;
  }
  
  if (isPackageBookingNow) {
    setPackageOptionsVisibility(false);
    if (packagesCollapsible) packagesCollapsible.style.display = 'none';
    if (packageQuestSelect) packageQuestSelect.style.display = 'block';
    
  } else {
    if (packageQuestSelect) packageQuestSelect.style.display = 'none';
    
    if (optionsGrid) {
      optionsGrid.style.display = 'grid';
      renderOptions(optionsForType);
    }
    if (optionsTitle) {
      const typeLabels = {
        'amongus': '⚡ Дополнительные опции для Among Us',
        'horror': '🕯️ Дополнительные опции для хоррор-свидания',
        'events': '🚐 Дополнительные услуги для выездного мероприятия',
        'default': '🎯 Дополнительные услуги'
      };
      optionsTitle.textContent = typeLabels[bookingType] || typeLabels.default;
      optionsTitle.style.display = 'block';
    }
    
    if (packagesCollapsible) packagesCollapsible.style.display = 'block';
  }
  
  overlay.classList.add('open');
  if (!document.body.classList.contains('standalone-booking-page')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  currentStep = 1;
  goStep(1);
  updateTotalDisplay();
  updateReceipt();
}

function closeBooking() {
  if (document.body.classList.contains('standalone-booking-page')) {
    window.location.href = 'index.html';
    return;
  }

  const overlay = document.getElementById('bookingOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  resetBookingData();
}

function initStandaloneBookingPage() {
  if (!document.body.classList.contains('standalone-booking-page')) return;

  const params = new URLSearchParams(window.location.search);
  const storedSelection = JSON.parse(sessionStorage.getItem('immerscapeBookingSelection') || 'null');
  const name = params.get('name') || storedSelection?.name || 'Невеста';
  const quest = questsData.find(q => q.name === name);
  const desc = params.get('desc') || storedSelection?.desc || 'Погрузитесь в атмосферу приключения!';
  const price = parseInt(params.get('price') || storedSelection?.price || (quest ? quest.price : 5500), 10);
  const isPackage = params.has('package')
    ? params.get('package') === '1'
    : Boolean(storedSelection?.isPackage) || getBookingType(name) === 'package';

  openBooking(name, desc, price, isPackage);
  const overlay = document.getElementById('bookingOverlay');
  if (overlay) overlay.classList.add('standalone-open');
}

// ============================================================
// ===== СБРОС ДАННЫХ =====
// ============================================================
function resetBookingData() {
  selectedDate = null;
  selectedTime = null;
  
  const dateEl = document.getElementById('selectedDate');
  if (dateEl) dateEl.textContent = 'Выберите дату';
  
  const timeGrid = document.getElementById('timeGrid');
  if (timeGrid) timeGrid.innerHTML = '';
  
  bookingPlayersValue = 1;
  const playersDisplay = document.getElementById('bookingPlayersDisplay');
  if (playersDisplay) playersDisplay.textContent = '1';
  
  const nameInput = document.getElementById('bookingName');
  const phoneInput = document.getElementById('bookingPhone');
  if (nameInput) nameInput.value = '';
  if (phoneInput) phoneInput.value = '';
  
  promoApplied = false;
  const promoInput = document.getElementById('promoInput');
  if (promoInput) promoInput.value = '';
  const promoStatus = document.getElementById('promoStatus');
  if (promoStatus) promoStatus.textContent = '';
  
  document.querySelectorAll('.option-checkbox').forEach(cb => {
    cb.checked = false;
    cb.closest('.option-card')?.classList.remove('active');
  });
  
  document.querySelectorAll('.contact-method').forEach(m => m.classList.remove('active'));
  const firstMethod = document.querySelector('.contact-method');
  if (firstMethod) firstMethod.classList.add('active');
  
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear = now.getFullYear();
  renderCalendar(currentMonth, currentYear);
}

// ============================================================
// ===== ШАГИ БРОНИРОВАНИЯ =====
// ============================================================
function goStep(n) {
  if (n === currentStep) return;
  if (n < 1 || n > 5) return;
  
  if (n > currentStep) {
    if (currentStep === 1) {
      const activeDate = document.querySelector('.date-grid .date-cell.active');
      const activeTime = document.querySelector('.time-slot.active');
      
      if (!activeDate) {
        showToast('⚠️ Выберите дату!');
        return;
      }
      if (!activeTime) {
        showToast('⚠️ Выберите время!');
        return;
      }
      
      selectedTime = activeTime.querySelector('.slot-time').textContent;
      if (!isCurrentPackageBooking()) {
        const questName = getCurrentQuestName();
        const price = getPriceByTime(questName, selectedTime);
        currentBookingPrice = price;
      }
      updateTotalDisplay();
      updateReceipt();
    }
    
    if (currentStep === 3) {
      const name = document.getElementById('bookingName').value.trim();
      const phone = document.getElementById('bookingPhone').value.trim();
      
      if (!name) {
        showToast('⚠️ Введите ваше имя!');
        return;
      }
      if (!phone) {
        showToast('⚠️ Введите номер телефона!');
        return;
      }
    }
  }
  
  document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.step-btn').forEach(el => el.classList.remove('active'));
  
  const targetContent = document.querySelector(`.step-content[data-step="${n}"]`);
  const targetBtn = document.querySelector(`.step-btn[data-step="${n}"]`);
  
  if (targetContent) targetContent.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');
  
  currentStep = n;
  const overlay = document.getElementById('bookingOverlay');
  if (overlay) overlay.scrollTop = 0;
  if (n === 4) updatePaymentStep(calculateBookingTotals());
  if (n === 5) updateReceipt();
}

function completePrepayment() {
  updatePaymentStep(calculateBookingTotals());
  goStep(5);
}

// ============================================================
// ===== КАЛЕНДАРЬ =====
// ============================================================
function renderCalendar(month, year) {
  const grid = document.getElementById('dateGrid');
  const label = document.getElementById('monthLabel');
  if (!grid || !label) return;
  
  grid.innerHTML = '';
  
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  label.textContent = `${months[month]} ${year}`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  weekdays.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'date-cell';
    cell.style.cssText = 'font-size:0.5rem; color:#6f648a; font-weight:600; border:none; padding:2px;';
    cell.textContent = day;
    grid.appendChild(cell);
  });
  
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startOffset; i++) {
    const cell = document.createElement('div');
    cell.className = 'date-cell other-month disabled';
    cell.textContent = daysInPrevMonth - startOffset + i + 1;
    grid.appendChild(cell);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const cell = document.createElement('div');
    cell.className = 'date-cell';
    const cellDate = new Date(year, month, i);
    cellDate.setHours(0, 0, 0, 0);
    
    if (cellDate < today) {
      cell.classList.add('disabled');
    }
    const api = externalBookingApi();
    const apiState = api?.getState(getCurrentQuestName());
    const cellKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    if (apiState?.loaded && api.getSlots(getCurrentQuestName(), cellKey).length === 0) {
      cell.classList.add('disabled');
    }
    
    if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      cell.style.borderColor = '#7c4dff';
      cell.style.borderWidth = '1px';
      cell.style.borderStyle = 'solid';
    }
    if (selectedDate && i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
      cell.classList.add('active');
    }
    cell.innerHTML = `<div class="cell-day">${i}</div>`;
    cell.dataset.date = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    if (!cell.classList.contains('disabled')) {
      cell.addEventListener('click', function() {
        document.querySelectorAll('.date-grid .date-cell').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const parts = this.dataset.date.split('-');
        selectedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dateStr = selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        document.getElementById('selectedDate').textContent = dateStr;
        document.getElementById('dateDropdown').classList.remove('open');
        document.getElementById('dateArrow').classList.remove('open');
        generateTimeSlots(getCurrentQuestName());
        updateTotalDisplay();
        updateReceipt();
      });
    }
    grid.appendChild(cell);
  }
  
  const totalCells = startOffset + daysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'date-cell other-month disabled';
    cell.textContent = i;
    grid.appendChild(cell);
  }
  
  const todayStr = formatDateKey(today);
  const todayCell = document.querySelector(`.date-grid .date-cell:not(.disabled)[data-date="${todayStr}"]`);
  if (todayCell && !selectedDate) {
    document.querySelectorAll('.date-grid .date-cell').forEach(c => c.classList.remove('active'));
    todayCell.classList.add('active');
    selectedDate = new Date(todayStr);
    document.getElementById('selectedDate').textContent = selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    generateTimeSlots(getCurrentQuestName());
    updateTotalDisplay();
    updateReceipt();
  }
}

// ============================================================
// ===== ГЕНЕРАЦИЯ ВРЕМЕНИ =====
// ============================================================
function generateTimeSlots(questName) {
  const grid = document.getElementById('timeGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const api = externalBookingApi();
  const apiState = api?.getState(questName);
  if (apiState?.loading) {
    grid.innerHTML = '<div class="schedule-message">Загружаем актуальное расписание…</div>';
    return;
  }
  if (apiState?.error) {
    grid.innerHTML = `<div class="schedule-message schedule-message-error">${apiState.error}</div>`;
  }
  
  const apiSlots = apiState?.loaded ? api.getSlots(questName, selectedDateKey()) : null;
  const times = apiSlots ? apiSlots.map(slot => slot.time) : (questTimes[questName] || ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30']);
  const busySlots = ['12:45', '14:00', '18:00', '20:15'];
  if (apiState?.loaded && times.length === 0) {
    grid.innerHTML = '<div class="schedule-message">На выбранную дату свободных сеансов нет.</div>';
    return;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const sortedTimes = times.sort();
  
  sortedTimes.forEach(time => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    const apiSlot = apiSlots?.find(item => item.time === time);
    const isBusy = apiSlot ? !apiSlot.available : busySlots.includes(time);
    
    const [hour, minute] = time.split(':').map(Number);
    const isPast = (selectedDate && selectedDate.toDateString() === now.toDateString() &&
      (hour < currentHour || (hour === currentHour && minute <= currentMinute)));
    
    if (isBusy) slot.classList.add('busy');
    if (isPast && !isBusy) slot.classList.add('disabled');
    
    const price = apiSlot?.price || getPriceByTime(questName, time);
    const priceText = price
      ? (isCurrentPackageBooking() && !isCustomPackageBooking() ? 'входит' : ` ${price} ₽`)
      : '';
    
    slot.innerHTML = `
      <div class="slot-time">${time}</div>
      <div class="slot-price" style="font-size:0.55rem; color:#b388ff; margin-top:1px;">${priceText}</div>
      <div class="slot-status ${isBusy ? 'busy' : (isPast ? 'прошло' : 'available')}">${isBusy ? 'занято' : (isPast ? 'прошло' : 'доступно')}</div>
    `;
    if (!isBusy && !isPast) {
      slot.addEventListener('click', function() {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
        if (!this.classList.contains('busy') && !this.classList.contains('disabled')) {
          this.classList.add('active');
          selectedTime = this.querySelector('.slot-time').textContent;
          if (!isCurrentPackageBooking()) {
            const questName = getCurrentQuestName();
            const price = getPriceByTime(questName, selectedTime);
            currentBookingPrice = price;
          }
          updateTotalDisplay();
          updateReceipt();
        }
      });
    }
    grid.appendChild(slot);
  });
}

function getCurrentQuestName() {
  const scheduleQuest = getScheduleQuestName();
  if (scheduleQuest) return scheduleQuest;
  return currentBookingName;
}

// ============================================================
// ===== РЕНДЕР ОПЦИЙ =====
// ============================================================
function renderOptions(options) {
  const container = document.getElementById('optionsGrid');
  if (!container) return;
  container.innerHTML = '';
  
  const optionsToRender = options || bookingOptions.default;
  
  optionsToRender.forEach(opt => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.dataset.optionId = opt.id;
    card.innerHTML = `
      <div class="option-check"></div>
      <div class="option-icon">${opt.icon}</div>
      <div class="option-name">${opt.name}</div>
      <div class="option-price">${opt.price} ₽</div>
      <div style="font-size:0.7rem; color:#9288b0; margin-top:4px; max-width:100%; display:block; line-height:1.4; padding:4px 8px; background:rgba(124,77,255,0.05); border-radius:8px;" class="option-desc">${opt.desc}</div>
      <button class="option-desc-toggle" style="background:rgba(124,77,255,0.15); border:1px solid rgba(124,77,255,0.2); color:#b388ff; font-size:0.6rem; cursor:pointer; margin-top:4px; padding:4px 12px; border-radius:40px; font-weight:600; transition:0.2s;">Скрыть описание</button>
      <input type="checkbox" class="option-checkbox" data-price="${opt.price}" data-name="${escapeAttr(opt.name)}" data-description="${escapeAttr(opt.desc || '')}" />
    `;
    
    const desc = card.querySelector('.option-desc');
    const toggleBtn = card.querySelector('.option-desc-toggle');
    let descVisible = true;
    
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      descVisible = !descVisible;
      desc.style.display = descVisible ? 'block' : 'none';
      this.textContent = descVisible ? 'Скрыть описание' : 'Показать описание';
    });
    
    card.addEventListener('click', function(e) {
      if (e.target.classList.contains('option-desc-toggle')) return;
      const checkbox = this.querySelector('.option-checkbox');
      checkbox.checked = !checkbox.checked;
      this.classList.toggle('active', checkbox.checked);
      updateTotalDisplay();
      updateReceipt();
    });
    
    container.appendChild(card);
  });
}

// ============================================================
// ===== КОНТАКТНЫЕ МЕТОДЫ =====
// ============================================================
function initContactMethods() {
  const methods = document.querySelectorAll('.contact-method');
  methods.forEach(method => {
    method.addEventListener('click', function() {
      methods.forEach(m => m.classList.remove('active'));
      this.classList.add('active');
      updateReceipt();
    });
  });
}

// ============================================================
// ===== ПРОМОКОД =====
// ============================================================
function isSelectedBookingWeekday() {
  if (!selectedDate) return false;
  const day = selectedDate.getDay();
  return day !== 0 && day !== 6;
}

function applyPromo(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const input = document.getElementById('promoInput');
  const status = document.getElementById('promoStatus');
  if (!input || !status) return;
  
  const code = input.value.trim().toLowerCase();
  
  // Проверяем будни/выходные по ВЫБРАННОЙ ДАТЕ бронирования,
  // а не по текущему дню на устройстве.
  const isWeekdaySelected = isSelectedBookingWeekday();
  isWeekday = isWeekdaySelected;

  if (!isWeekdaySelected) {
    status.textContent = selectedDate
      ? '❌ Промокод действует только в будние дни!'
      : '❌ Выберите дату, чтобы применить промокод!';
    status.style.color = '#ff6b6b';
    promoApplied = false;
    updateTotalDisplay();
    updateReceipt();
    return;
  }
  
  if (code === promoCode || code === 'тест10') {
    promoApplied = true;
    status.textContent = '✅ Ваш промокод применён! Скидка 10%';
    status.style.color = '#4ecdc4';
  } else {
    // Не сбрасываем выборы/шаги: просто выключаем скидку.
    promoApplied = false;
    status.textContent = '❌ Неверный промокод';
    status.style.color = '#ff6b6b';
  }

  // Важно: не вызывать resetBookingData() и не трогать selectedDate/selectedTime здесь.


  
  updateTotalDisplay();
  updateReceipt();
}

// ============================================================
// ===== ОБНОВЛЕНИЕ КВИТАНЦИИ =====
// ============================================================
function updateReceipt() {
  const dateStr = getSelectedDateDisplay();
  
  const totals = calculateBookingTotals();
  const time = totals.activeTime ? totals.activeTime.querySelector('.slot-time').textContent : '—';
  
  let optionNames = '—';
  const selectedOptions = document.querySelectorAll('.option-checkbox:checked');
  if (selectedOptions.length > 0) {
    optionNames = Array.from(selectedOptions).map(el => el.dataset.name).join(', ');
  }

  if (isCurrentPackageBooking()) {
    const packageQuest = getSelectedPackageQuest();
    const questPriceText = totals.packageQuestPrice ? ` (${formatMoney(totals.packageQuestPrice)})` : '';
    optionNames = packageQuest
      ? `${optionNames === '—' ? '' : `${optionNames}; `}Квест в пакете: ${packageQuest}${questPriceText}`
      : `${optionNames === '—' ? '' : `${optionNames}; `}Квест в пакете: выбрать позже`;
  }
  
  const activeMethod = document.querySelector('.contact-method.active');
  const methodName = activeMethod ? activeMethod.textContent.trim() : 'WhatsApp';
  
  const receiptQuest = document.getElementById('receiptQuest');
  const receiptDateTime = document.getElementById('receiptDateTime');
  const receiptPlayers = document.getElementById('receiptPlayers');
  const receiptExtras = document.getElementById('receiptExtras');
  const receiptMethod = document.getElementById('receiptMethod');
  const receiptSubtotal = document.getElementById('receiptSubtotal');
  const receiptDiscount = document.getElementById('receiptDiscount');
  const receiptTotal = document.getElementById('receiptTotal');
  
  if (receiptQuest) receiptQuest.textContent = currentBookingName;
  if (receiptDateTime) receiptDateTime.textContent = `${dateStr}, ${time}`;
  if (receiptPlayers) receiptPlayers.textContent = totals.players;
  if (receiptExtras) receiptExtras.textContent = optionNames;
  if (receiptMethod) receiptMethod.textContent = methodName;
  if (receiptSubtotal) receiptSubtotal.textContent = formatMoney(totals.subtotal);
  if (receiptDiscount) receiptDiscount.textContent = totals.discount > 0 ? `-${formatMoney(totals.discount)}` : '—';
  if (receiptTotal) receiptTotal.textContent = formatMoney(totals.total);
  
  updateTotalDisplay();
}

// ============================================================
// ===== ПОДТВЕРЖДЕНИЕ БРОНИ =====
// ============================================================
async function confirmBooking() {
  const name = document.getElementById('bookingName').value.trim();
  const phone = document.getElementById('bookingPhone').value.trim();
  if (!name || !phone) {
    showToast('⚠️ Заполните имя и телефон!');
    return;
  }
  
  const questName = document.getElementById('receiptQuest').textContent;
  const dateTime = document.getElementById('receiptDateTime').textContent;
  const players = document.getElementById('receiptPlayers').textContent;
  const total = document.getElementById('receiptTotal').textContent;
  const email = document.getElementById('bookingEmail')?.value.trim() || '';
  const clientComment = document.getElementById('bookingComment')?.value.trim() || '';
  const selectedServices = Array.from(document.querySelectorAll('.option-checkbox:checked')).map(option => ({
    name: option.dataset.name || '',
    price: Number(option.dataset.price) || 0
  }));
  const servicesText = selectedServices.map(service => `${service.name} — ${service.price} ₽`).join('; ');
  const integrationComment = clientComment;

  const button = document.querySelector('#receiptBox .btn-primary');
  if (button) button.disabled = true;

  // Бронь и карточка клиента создаются одной транзакцией только в Supabase.
  // Расписание my-ERP по-прежнему доступно для просмотра, но новые брони туда не отправляются.
  try {
    const config = window.IMMERSCAPE_SUPABASE_CONFIG;
    const staffClient = window.ImmerscapeSupabaseAuth?.createClient(config?.url, config?.publishableKey);
    if (!staffClient) throw new Error('Локальная база бронирований недоступна. Обновите страницу и попробуйте снова.');
    const { data: { session } } = staffClient ? await staffClient.auth.getSession() : { data: { session: null } };
    const idempotencyKey = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const gridResult = await staffClient.staff.rpc('create_site_booking', {
      p_idempotency_key: idempotencyKey,
      p_booking: {
        user_id: session?.user?.id || null,
        quest_name: currentBookingName,
        booking_date: selectedDateKey(),
        booking_time: selectedTime || '00:00',
        client_name: name,
        client_phone: phone,
        client_email: email || session?.user?.email || '',
        players: bookingPlayersValue,
        comment: integrationComment,
        extra_services: servicesText,
        total_amount: total
      }
    });
    if (gridResult?.error) throw gridResult.error;
    console.info('Локальная бронь и клиент созданы', { idempotencyKey, bookingId: gridResult.data });
  } catch (error) {
    console.error('Не удалось создать локальную бронь и клиента:', error);
    showToast(`❌ Не удалось создать бронь: ${error.message}`, 5000);
    if (button) button.disabled = false;
    return;
  }
  
  showToast(`✅ Бронирование подтверждено! ${questName} на ${dateTime} для ${players} чел. Итого: ${total}`);
  
  setTimeout(() => {
    closeBooking();
    if (button) button.disabled = false;
  }, 2000);
}

// ============================================================
// ===== ИНИЦИАЛИЗАЦИЯ =====
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  ensureBookingUi();

  const closeBtn = document.getElementById('closeOverlayBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeBooking);
  
  const dateToggle = document.getElementById('dateToggle');
  if (dateToggle) {
    dateToggle.addEventListener('click', function() {
      const dropdown = document.getElementById('dateDropdown');
      const arrow = document.getElementById('dateArrow');
      if (dropdown && arrow) {
        dropdown.classList.toggle('open');
        arrow.classList.toggle('open');
      }
    });
  }
  
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar(currentMonth, currentYear);
    });
  }
  
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderCalendar(currentMonth, currentYear);
    });
  }
  
  const packageChoice = document.getElementById('packageQuestChoice');
  if (packageChoice) {
    packageChoice.addEventListener('change', function() {
      selectedPackageQuest = this.value || '';
      selectedTime = null;
      const scheduleQuest = getScheduleQuestName();
      const api = externalBookingApi();
      if (api?.getConfig(scheduleQuest)) {
        generateTimeSlots(scheduleQuest);
        api.load(scheduleQuest).then(() => {
          if (getScheduleQuestName() !== scheduleQuest) return;
          renderCalendar(currentMonth, currentYear);
          generateTimeSlots(scheduleQuest);
          updateTotalDisplay();
          updateReceipt();
        });
      } else {
        renderCalendar(currentMonth, currentYear);
        generateTimeSlots(scheduleQuest);
      }
      updateBookingPhotos(selectedPackageQuest || currentBookingName);
      updateTotalDisplay();
      updateReceipt();
    });
  }
  
  const promoBtn = document.getElementById('applyPromoBtn');
  if (promoBtn) promoBtn.addEventListener('click', applyPromo);
  
  const promoInput = document.getElementById('promoInput');
  if (promoInput) {
    promoInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyPromo();
      }
    });
  }

  document.querySelectorAll('[data-payment-link]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href') || '';
      if (href === '#') {
        e.preventDefault();
        showToast('Сюда нужно вставить ссылку для внесения предоплаты');
      }
    });
  });
  
  document.addEventListener('change', function(e) {
    if (e.target.closest('.option-checkbox') || e.target.closest('.contact-method') ||
        e.target.closest('.time-slot') || e.target.closest('.date-cell') ||
        e.target.closest('.package-mini') || e.target.id === 'packageQuestChoice') {
      updateTotalDisplay();
      updateReceipt();
    }
  });
  
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const step = parseInt(this.dataset.step);
      if (step <= currentStep + 1 && step >= 1) {
        goStep(step);
      }
    });
  });
  
  initBookingPhotos();
  initContactMethods();
  initStandaloneBookingPage();
});

// ============================================================
// ===== КАРУСЕЛЬ ФОТО =====
// ============================================================
function initBookingPhotos() {
  const track = document.getElementById('bookingPhotosTrack');
  const slides = track ? track.querySelectorAll('.booking-photos-slide') : [];
  const prevBtn = document.getElementById('photosPrev');
  const nextBtn = document.getElementById('photosNext');
  
  if (slides.length === 0) return;
  
  if (prevBtn) prevBtn.addEventListener('click', function() {
    goToBookingPhoto(currentBookingPhotoIndex - 1);
  });
  if (nextBtn) nextBtn.addEventListener('click', function() {
    goToBookingPhoto(currentBookingPhotoIndex + 1);
  });
}

// ============================================================
// ===== ИЗМЕНЕНИЕ КОЛИЧЕСТВА УЧАСТНИКОВ =====
// ============================================================
function changeBookingPlayers(delta) {
  const quest = questsData.find(q => q.name === currentBookingName);
  const minPlayers = (quest && quest.minPlayers) || 1;
  const maxPlayers = 20;
  const newValue = bookingPlayersValue + delta;
  
  if (newValue < minPlayers) {
    showToast(`⚠️ Минимальное количество участников: ${minPlayers}`);
    return;
  }
  if (newValue > maxPlayers) {
    showToast(`⚠️ Максимальное количество участников: ${maxPlayers}`);
    return;
  }
  
  bookingPlayersValue = newValue;
  const display = document.getElementById('bookingPlayersDisplay');
  if (display) display.textContent = bookingPlayersValue;
  updateTotalDisplay();
  updateReceipt();
}

// ============================================================
// ===== ПАКЕТЫ НА ГЛАВНОЙ =====
// ============================================================
function bookPackage(name, price) {
  openBooking(name, `Готовый пакет "${name}". Квест на выбор входит в стоимость.`, price, true);
}

function bookCustomPackage() {
  const selected = document.querySelectorAll('.constructor-options .option-card.active');
  const items = Array.from(selected).map(el => el.dataset.name);
  const players = parseInt(document.getElementById('constructorPlayersDisplay').textContent) || 3;
  const optionsTotal = Array.from(selected).reduce((sum, el) => sum + parseInt(el.dataset.price), 0);
  const extraPlayerCost = players > 3 ? (players - 3) * 1500 : 0;
  const finalTotal = optionsTotal + extraPlayerCost;
  const name = `Свой пакет с нуля${items.length ? ` (${items.join(', ')})` : ''}`;
  openBooking(name, `Персональный пакет с нуля для ${players} участников. К цене добавится квест на выбор по дате и времени. Дополнения: ${items.join(', ') || 'без дополнений'}.`, finalTotal, true);
}

// ============================================================
// ===== КОНСТРУКТОР =====
// ============================================================
let constructorPlayersValue = 3;

function changeConstructorPlayers(delta) {
  constructorPlayersValue = Math.max(1, Math.min(20, constructorPlayersValue + delta));
  const display = document.getElementById('constructorPlayersDisplay');
  if (display) display.textContent = constructorPlayersValue;
  updateConstructor();
}

function updateConstructor() {
  const selected = document.querySelectorAll('.constructor-options .option-card.active');
  const items = Array.from(selected).map(el => ({ name: el.dataset.name, price: parseInt(el.dataset.price) }));
  const container = document.getElementById('constructorItems');
  if (!container) return;
  
  const extraPlayerCost = constructorPlayersValue > 3 ? (constructorPlayersValue - 3) * 1500 : 0;
  container.innerHTML = `<div class="preview-item"><span>Квест на выбор</span><span>+ цена по слоту</span></div>` + items.map(item =>
    `<div class="preview-item"><span>${item.name}</span><span>${item.price} ₽</span></div>`
  ).join('') + (extraPlayerCost > 0
    ? `<div class="preview-item"><span>Доп. участники</span><span>${extraPlayerCost} ₽</span></div>`
    : '');
  const total = items.reduce((sum, i) => sum + i.price, 0) + extraPlayerCost;
  const totalEl = document.getElementById('constructorTotal');
  if (totalEl) {
    totalEl.textContent = `${total.toLocaleString('ru-RU')} ₽ + квест`;
  }
}

// ============================================================
// ===== КНОПКИ БРОНИРОВАНИЯ =====
// ============================================================
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn-book-sm');
  if (!btn) return;
  
  const name = btn.dataset.questName || btn.dataset.package || 'Квест';
  const price = parseInt(btn.dataset.price || btn.dataset.questPrice || 0);
  const desc = btn.dataset.questDesc || 'Погрузитесь в атмосферу приключения!';
  
  e.preventDefault();
  openBooking(name, desc, price, !!btn.dataset.package);
});
