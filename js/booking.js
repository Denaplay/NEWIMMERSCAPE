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
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const today = new Date();
today.setHours(0, 0, 0, 0);
let promoApplied = false;
let promoCode = 'квест10';
let isWeekday = true;

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
    photos: ['🦷', '🪥', '🔬'], 
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
    photos: ['🚀', '🛸', '🌌'], 
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
    photos: ['🎤', '💿', '🌟'], 
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
    photos: ['👻', '🕯️', '💍'], 
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
    photos: ['🚪', '🔑', '👁️'], 
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
    photos: ['🌀', '🧠', '🌑'], 
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
    photos: ['🛸', '🔍', '🎯'], 
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
    photos: ['👻', '🕯️', '💍'], 
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
    photos: ['🧙', '⚡', '📚'], 
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
    photos: ['🧚', '🌈', '✨'], 
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
    photos: ['⛪', '🕯️', '📜'], 
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
    photos: ['🎄', '🎁', '💚'], 
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
    photos: ['👻', '🕯️', '🌙'], 
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
  'Пакет на 1 час': ['🎂', '🎁', '🎈'],
  'Пакет на 2 часа': ['🎂', '🎁', '🎈', '⭐'],
  'Пакет на 2.5 часа': ['🎂', '🎁', '🎈', '⭐', '🎮'],
  'Пакет на 3.5 часа': ['🎂', '🎁', '🎈', '⭐', '🎮', '🎪']
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
    'м. Таганская': 'Первомайская ул., 5',
    'м. Измайловская': 'Большой Факельный пер., 2/22',
    'Профсоюзная': 'ул. Кржижановского, 8, корп. 2',
    'Таганская': 'Первомайская ул., 5',
    'Измайловская': 'Большой Факельный пер., 2/22'
  };
  return addresses[location] || 'Москва';
}

function getMapUrl(location) {
  const maps = {
    'м. Профсоюзная': 'https://yandex.ru/maps/-/CTuYB071',
    'Профсоюзная': 'https://yandex.ru/maps/-/CTuYB071',
    'м. Таганская': 'https://yandex.ru/maps/-/CTuYBOz0',
    'Таганская': 'https://yandex.ru/maps/-/CTuYBOz0',
    'м. Измайловская': 'https://yandex.ru/maps/-/CTuYi68-',
    'Измайловская': 'https://yandex.ru/maps/-/CTuYi68-'
  };
  return maps[location] || 'https://yandex.ru/maps/-/CTuYB071';
}

// ============================================================
// ===== ПОЛУЧЕНИЕ ЦЕНЫ ПО ВРЕМЕНИ =====
// ============================================================
function getPriceByTime(questName, timeSlot) {
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
    return ['🎂', '🎁', '🎈'];
  }
  const quest = questsData.find(q => q.name === questName);
  return quest && quest.photos ? quest.photos : ['🎭', '🔮', '✨'];
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
  photos.forEach((emoji, index) => {
    const slide = document.createElement('div');
    slide.className = 'booking-photos-slide';
    slide.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:4rem;">${emoji}</div>
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
  const players = parseInt(document.getElementById('bookingPlayersDisplay').textContent) || 1;
  const activeTime = document.querySelector('.time-slot.active');
  const selectedOptions = document.querySelectorAll('.option-checkbox:checked');
  
  // === ОПРЕДЕЛЯЕМ БАЗОВУЮ ЦЕНУ ===
  let basePrice = 0;
  
  if (activeTime && currentBookingName) {
    const time = activeTime.querySelector('.slot-time').textContent;
    const priceByTime = getPriceByTime(currentBookingName, time);
    if (priceByTime) {
      basePrice = priceByTime;
      currentBookingPrice = priceByTime;
    }
  } else {
    const quest = questsData.find(q => q.name === currentBookingName);
    if (quest) {
      basePrice = quest.price;
      currentBookingPrice = quest.price;
    }
  }
  
  // === СЧИТАЕМ ОПЦИИ ===
  let optionTotal = 0;
  selectedOptions.forEach(el => {
    optionTotal += parseInt(el.dataset.price || 0);
  });
  
  // === УЧАСТНИКИ (база 3 человека) ===
  const basePlayers = 3;
  let extraPlayerCost = 0;
  if (players > basePlayers) {
    extraPlayerCost = (players - basePlayers) * 1500;
  }
  
  // === ПОДСЧЁТ ИТОГО ===
  const subtotal = basePrice + optionTotal + extraPlayerCost;
  
  // === СКИДКА ПО ПРОМОКОДУ ===
  // Будни/выходные определяем по выбранной дате бронирования
  const day = selectedDate ? selectedDate.getDay() : null;
  const isWeekdayNow = day !== null && day !== 0 && day !== 6;
  let discount = 0;
  if (promoApplied && isWeekdayNow) {
    discount = Math.round(subtotal * 0.1);
  }

  
  const total = subtotal - discount;
  const deposit = 1500; // Предоплата
  
  // Для UI: показываем цену квеста со скидкой так, чтобы пользователь видел скидку в блоке "Цена квеста"
  // (распределяем скидку пропорционально всей сумме, а не только на basePrice)
  const discountedBasePrice = subtotal > 0 ? Math.round(basePrice - (basePrice / subtotal) * discount) : basePrice;
  
  // === ОБНОВЛЯЕМ ОТОБРАЖЕНИЕ ===
  // Шаг 1
  const totalDisplay = document.getElementById('bookingTotalDisplay');
  if (totalDisplay) {
    totalDisplay.textContent = `${total} ₽`;
  }
  
  // Шаг 2
  const totalDisplayStep2 = document.getElementById('bookingTotalDisplayStep2');
  if (totalDisplayStep2) {
    totalDisplayStep2.textContent = `${total} ₽`;
  }
  
  // Шаг 3
  const totalDisplayStep3 = document.getElementById('bookingTotalDisplayStep3');
  if (totalDisplayStep3) {
    totalDisplayStep3.textContent = `${total} ₽`;
  }
  
  // Шаг 4
  const totalDisplayStep4 = document.getElementById('bookingTotalDisplayStep4');
  if (totalDisplayStep4) {
    totalDisplayStep4.textContent = `${total} ₽`;
  }
  
  // Цена квеста (со скидкой)
  const priceDisplay = document.getElementById('bookingPriceDisplay');
  if (priceDisplay) {
    priceDisplay.textContent = discountedBasePrice;
  }
  
  const priceDisplay2 = document.getElementById('bookingPriceDisplay2');
  if (priceDisplay2) {
    priceDisplay2.textContent = discountedBasePrice;
  }
  const priceDisplay3 = document.getElementById('bookingPriceDisplay3');
  if (priceDisplay3) {
    priceDisplay3.textContent = discountedBasePrice;
  }
  
  const priceDisplay4 = document.getElementById('bookingPriceDisplay4');
  if (priceDisplay4) {
    priceDisplay4.textContent = discountedBasePrice;
  }
  
  const depositDisplay = document.getElementById('bookingDepositDisplay');
  if (depositDisplay) {
    depositDisplay.textContent = `${deposit} ₽`;
  }
  
  const depositDisplay2 = document.getElementById('bookingDepositDisplay2');
  if (depositDisplay2) {
    depositDisplay2.textContent = `${deposit} ₽`;
  }
  
  const depositDisplay3 = document.getElementById('bookingDepositDisplay3');
  if (depositDisplay3) {
    depositDisplay3.textContent = `${deposit} ₽`;
  }
  
  const depositDisplay4 = document.getElementById('bookingDepositDisplay4');
  if (depositDisplay4) {
    depositDisplay4.textContent = `${deposit} ₽`;
  }
}



// ============================================================
// ===== ОТКРЫТИЕ / ЗАКРЫТИЕ БРОНИРОВАНИЯ =====
// ============================================================

function openBooking(name, desc, price, isPackage) {
  resetBookingData();
  
  document.querySelectorAll('.page-overlay').forEach(el => el.classList.remove('open'));
  
  isPackageBooking = isPackage || false;
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
  selectedDate = null;
  selectedTime = null;
  
  renderCalendar(currentMonth, currentYear);
  
  bookingPlayersValue = (quest && quest.minPlayers) || 1;
  document.getElementById('bookingPlayersDisplay').textContent = String(bookingPlayersValue);
  
  promoApplied = false;
  const promoInput = document.getElementById('promoInput');
  if (promoInput) promoInput.value = '';
  
  const bookingType = getBookingType(name);
  const isPackageBookingNow = bookingType === 'package';
  const optionsForType = getOptionsByType(bookingType);
  
  const optionsGrid = document.getElementById('optionsGrid');
  const packagesCollapsible = document.getElementById('packagesCollapsible');
  const packageQuestSelect = document.getElementById('packageQuestSelect');
  const optionsTitle = document.querySelector('.step-content[data-step="2"] h3');
  
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
        ></iframe>
        <div style="padding:8px 12px; background:#1a1625; font-size:0.75rem; color:#b0a8c8;">
          📍 ${location}: ${address}
        </div>
      </div>
    `;
  }
  
  if (isPackageBookingNow) {
    if (optionsGrid) {
      optionsGrid.style.display = 'grid';
      renderOptions(optionsForType);
    }
    if (optionsTitle) {
      optionsTitle.textContent = '🎁 Опции для вашего пакета';
      optionsTitle.style.display = 'block';
    }
    if (packagesCollapsible) packagesCollapsible.style.display = 'none';
    if (packageQuestSelect) packageQuestSelect.style.display = 'none';
    
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
    
    if (packagesCollapsible) packagesCollapsible.style.display = 'none';
  }
  
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  currentStep = 1;
  goStep(1);
  updateTotalDisplay();
  updateReceipt();
}

function closeBooking() {
  const overlay = document.getElementById('bookingOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  resetBookingData();
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
  if (n < 1 || n > 4) return;
  
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
      const questName = getCurrentQuestName();
      const price = getPriceByTime(questName, selectedTime);
      currentBookingPrice = price;
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
  if (n === 4) updateReceipt();
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
  
  const todayStr = today.toISOString().split('T')[0];
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
  
  const times = questTimes[questName] || ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30'];
  const busySlots = ['12:45', '14:00', '18:00', '20:15'];
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const sortedTimes = times.sort();
  
  sortedTimes.forEach(time => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    const isBusy = busySlots.includes(time);
    
    const [hour, minute] = time.split(':').map(Number);
    const isPast = (selectedDate && selectedDate.toDateString() === now.toDateString() &&
      (hour < currentHour || (hour === currentHour && minute <= currentMinute)));
    
    if (isBusy) slot.classList.add('busy');
    if (isPast && !isBusy) slot.classList.add('disabled');
    
    const price = getPriceByTime(questName, time);
    const priceText = price ? ` ${price} ₽` : '';
    
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
          const questName = getCurrentQuestName();
          const price = getPriceByTime(questName, selectedTime);
          currentBookingPrice = price;
          updateTotalDisplay();
          updateReceipt();
        }
      });
    }
    grid.appendChild(slot);
  });
}

function getCurrentQuestName() {
  const select = document.getElementById('packageQuestChoice');
  if (select && document.getElementById('packageQuestSelect').style.display !== 'none') {
    return select.value;
  }
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
      <input type="checkbox" class="option-checkbox" data-price="${opt.price}" data-name="${escapeAttr(opt.name)}" />
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
function applyPromo() {
  const input = document.getElementById('promoInput');
  const status = document.getElementById('promoStatus');
  if (!input || !status) return;
  
  const code = input.value.trim().toLowerCase();
  
  // Проверяем будни/выходные по ВЫБРАННОЙ ДАТЕ бронирования,
  // а не по текущему дню на устройстве.
  let isWeekdaySelected = false;
  if (selectedDate) {
    const day = selectedDate.getDay();
    isWeekdaySelected = day !== 0 && day !== 6;
  }
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
  
  if (code === 'квест10' || code === 'тест10') {
    promoApplied = true;
    status.textContent = '✅ Промокод применён! Скидка 10%';
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
  const activeDate = document.querySelector('.date-grid .date-cell.active');
  let dateStr = 'Не выбрана';
  if (activeDate) {
    const parts = activeDate.dataset.date.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    dateStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  
  const activeTime = document.querySelector('.time-slot.active');
  const time = activeTime ? activeTime.querySelector('.slot-time').textContent : '—';
  const players = parseInt(document.getElementById('bookingPlayersDisplay').textContent) || 1;
  
  const bookingType = getBookingType(currentBookingName);
  const isPackage = bookingType === 'package';
  
  let optionNames = '—';
  let optionTotal = 0;
  const selectedOptions = document.querySelectorAll('.option-checkbox:checked');
  if (selectedOptions.length > 0) {
    optionNames = Array.from(selectedOptions).map(el => el.dataset.name).join(', ');
    optionTotal = Array.from(selectedOptions).reduce((sum, el) => sum + parseInt(el.dataset.price || 0), 0);
  }
  
  const activeMethod = document.querySelector('.contact-method.active');
  const methodName = activeMethod ? activeMethod.textContent.trim() : 'WhatsApp';
  
  let basePrice = currentBookingPrice;
  if (activeTime && currentBookingName) {
    const selectedTime = activeTime.querySelector('.slot-time').textContent;
    const priceByTime = getPriceByTime(currentBookingName, selectedTime);
    if (priceByTime) basePrice = priceByTime;
  }
  
  const basePlayers = 3;
  let extraPlayerCost = 0;
  if (players > basePlayers) {
    extraPlayerCost = (players - basePlayers) * 1500;
  }
  
  const subtotal = basePrice + optionTotal + extraPlayerCost;
  
  // Будни/выходные определяем по ВЫБРАННОЙ ДАТЕ бронирования
  const day = selectedDate ? selectedDate.getDay() : null;
  const isWeekday = day !== null && day !== 0 && day !== 6;
  let discount = 0;
  if (promoApplied && isWeekday) {
    discount = Math.round(subtotal * 0.1);
  }

  
  const total = subtotal - discount;
  
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
  if (receiptPlayers) receiptPlayers.textContent = players;
  if (receiptExtras) receiptExtras.textContent = optionNames;
  if (receiptMethod) receiptMethod.textContent = methodName;
  if (receiptSubtotal) receiptSubtotal.textContent = `${subtotal} ₽`;
  if (receiptDiscount) receiptDiscount.textContent = discount > 0 ? `-${discount} ₽` : '—';
  if (receiptTotal) receiptTotal.textContent = `${total} ₽`;
  
  updateTotalDisplay();
}

// ============================================================
// ===== ПОДТВЕРЖДЕНИЕ БРОНИ =====
// ============================================================
function confirmBooking() {
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
  
  showToast(`✅ Бронирование подтверждено! ${questName} на ${dateTime} для ${players} чел. Итого: ${total}`);
  
  setTimeout(() => {
    closeBooking();
  }, 2000);
}

// ============================================================
// ===== ИНИЦИАЛИЗАЦИЯ =====
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
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
      generateTimeSlots(this.value);
      updateBookingPhotos(this.value);
      const quest = questsData.find(q => q.name === this.value);
      if (quest) {
        currentBookingPrice = quest.price;
      }
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
  openBooking(name, `Готовый пакет "${name}" с максимальной выгодой.`, price, true);
}

function bookCustomPackage() {
  const selected = document.querySelectorAll('.constructor-options .option-card.active');
  const items = Array.from(selected).map(el => el.dataset.name);
  const players = parseInt(document.getElementById('constructorPlayersDisplay').textContent) || 4;
  const total = Array.from(selected).reduce((sum, el) => sum + parseInt(el.dataset.price), 0);
  const finalTotal = Math.round(total * 0.9);
  const name = `Свой пакет (${items.join(', ') || 'базовый'})`;
  openBooking(name, `Персональный пакет для ${players} участников. Включено: ${items.join(', ') || 'базовый набор'}.`, finalTotal, true);
}

// ============================================================
// ===== КОНСТРУКТОР =====
// ============================================================
let constructorPlayersValue = 4;

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
  
  container.innerHTML = items.map(item =>
    `<div class="preview-item"><span>${item.name}</span><span>${item.price} ₽</span></div>`
  ).join('');
  if (items.length === 0) {
    container.innerHTML = `<div class="preview-item" style="color:#6f648a;">Выберите опции</div>`;
  }
  const total = items.reduce((sum, i) => sum + i.price, 0);
  const discount = Math.round(total * 0.1);
  const finalTotal = total - discount;
  const totalEl = document.getElementById('constructorTotal');
  if (totalEl) {
    totalEl.innerHTML = total > 0 ? `<small>${total} ₽</small> ${finalTotal} ₽ (скидка -10%)` : `0 ₽`;
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