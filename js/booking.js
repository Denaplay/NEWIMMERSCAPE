// ===== BOOKING SYSTEM =====
// Глобальные переменные
let currentStep = 1;
let currentBookingPrice = 3500;
let currentBookingName = 'Невеста';
let currentBookingDesc = '';
let isPackageBooking = false;
let bookingPlayersValue = 4;
let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const today = new Date();
today.setHours(0, 0, 0, 0);

// ===== ДАННЫЕ КВЕСТОВ (для бронирования) =====
const questsData = [
  { name: 'Стоматология "Новая жизнь"', price: 3500, time: '60 мин', players: '2–6', difficulty: '4/5', photos: ['🦷', '🪥', '🔬'], loc: 'м. Профсоюзная' },
  { name: 'Рик и Морти', price: 3200, time: '60 мин', players: '2–6', difficulty: '3/5', photos: ['🚀', '🛸', '🌌'], loc: 'м. Профсоюзная' },
  { name: 'K-pop: последний стрим', price: 3700, time: '75 мин', players: '3–8', difficulty: '4/5', photos: ['🎤', '💿', '🌟'], loc: 'м. Профсоюзная' },
  { name: 'Запретная дверь', price: 3900, time: '70 мин', players: '2–5', difficulty: '5/5', photos: ['🚪', '🔑', '👁️'], loc: 'м. Измайловская' },
  { name: 'Изнанка в разуме Векны', price: 4200, time: '80 мин', players: '2–6', difficulty: '5/5', photos: ['🌀', '🧠', '🌑'], loc: 'м. Измайловская' },
  { name: 'Невеста', price: 3500, time: '60 мин', players: '2–6', difficulty: '4/5', photos: ['👻', '🕯️', '💍'], loc: 'м. Таганская' },
  { name: 'Хогвартс', price: 3100, time: '60 мин', players: '2–7', difficulty: '3/5', photos: ['🧙', '⚡', '📚'], loc: 'м. Таганская' },
  { name: 'Лабубу: волшебный мир', price: 2800, time: '50 мин', players: '2–8', difficulty: '2/5', photos: ['🧚', '🌈', '✨'], loc: 'м. Таганская' },
  { name: 'Монастырь', price: 3900, time: '70 мин', players: '2–6', difficulty: '5/5', photos: ['⛪', '🕯️', '📜'], loc: 'м. Таганская' },
  { name: 'Гринч', price: 2900, time: '55 мин', players: '2–8', difficulty: '2/5', photos: ['🎄', '🎁', '💚'], loc: 'м. Таганская' },
  { name: 'Among Us', price: 4200, time: '60 мин', players: '4–10', difficulty: '4/5', photos: ['🛸', '🔍', '🎯'], loc: 'м. Измайловская' }
];

// ===== ФОТО ДЛЯ ПАКЕТОВ (по умолчанию) =====
const packagePhotos = {
  'Пакет на 1 час': ['🎂', '🎁', '🎈'],
  'Пакет на 2 часа': ['🎂', '🎁', '🎈', '⭐'],
  'Пакет на 2.5 часа': ['🎂', '🎁', '🎈', '⭐', '🎮'],
  'Пакет на 3.5 часа': ['🎂', '🎁', '🎈', '⭐', '🎮', '🎪']
};

// ===== ВРЕМЕННЫЕ СЛОТЫ =====
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
  'Стоматология "Новая жизнь"': ['00:00', '01:15', '09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30', '22:45']
};

// ===== ОПЦИИ ДЛЯ РАЗНЫХ ТИПОВ БРОНИРОВАНИЯ =====
const bookingOptions = {
  // Стандартные опции для обычных квестов
  default: [
    { id: 'video', name: 'Видеоролик', price: 2000, icon: '🎥', desc: 'Профессиональная видео-нарезка самых ярких моментов вашего приключения.' },
    { id: 'director', name: 'Кресло режиссёра', price: 1500, icon: '🎬', desc: 'Наблюдайте за игрой со стороны и управляйте процессом.' },
    { id: 'actor', name: 'Доп. персонаж', price: 2500, icon: '🎭', desc: 'Ещё один актёр для более насыщенного сюжета.' },
    { id: 'loft', name: 'Лофт', price: 2000, icon: '🏠', desc: 'Уютное пространство для празднования после квеста.' },
    { id: 'mafia', name: 'Мафия', price: 1500, icon: '🕵️', desc: 'Интеллектуальная игра с живым ведущим после квеста.' },
    { id: 'congrats', name: 'Поздравление', price: 1000, icon: '🎉', desc: 'Креативное поздравление для именинника с сюрпризами.' },
    { id: 'photographer', name: 'Фотограф', price: 3000, icon: '📸', desc: 'Профессиональная фотосъёмка в процессе прохождения квеста.' }
  ],
  // Опции для Among Us
  amongus: [
    { id: 'extra_round', name: 'Дополнительный раунд', price: 2000, icon: '🔄', desc: 'Добавьте ещё один раунд игры для большего адреналина!' },
    { id: 'costumes', name: 'Костюмы персонажей', price: 1500, icon: '👽', desc: 'Наденьте костюмы персонажей Among Us для полного погружения.' },
    { id: 'host', name: 'Специальный ведущий', price: 2500, icon: '🎙️', desc: 'Профессиональный ведущий, который будет управлять игрой.' },
    { id: 'photo', name: 'Фотосессия', price: 2000, icon: '📸', desc: 'Профессиональная фотосессия в костюмах Among Us.' },
    { id: 'video', name: 'Видео-нарезка', price: 3000, icon: '🎥', desc: 'Динамичная видео-нарезка с самыми яркими моментами игры.' }
  ],
  // Опции для Хоррор-свидания
  horror: [
    { id: 'fear_level', name: 'Повышенный уровень страха', price: 2000, icon: '😱', desc: 'Увеличьте уровень страха — более интенсивные эффекты и неожиданные моменты.' },
    { id: 'extra_actor', name: 'Дополнительный актёр', price: 2500, icon: '🎭', desc: 'Ещё один актёр для более насыщенного и страшного сюжета.' },
    { id: 'video', name: 'Видео-нарезка', price: 3000, icon: '🎥', desc: 'Профессиональная видео-нарезка самых ярких моментов вашего хоррор-свидания.' },
    { id: 'romantic_dinner', name: 'Романтический ужин', price: 3500, icon: '🍷', desc: 'Уютный ужин при свечах после прохождения квеста.' },
    { id: 'proposal', name: 'Организация предложения', price: 5000, icon: '💍', desc: 'Поможем сделать предложение руки и сердца в нестандартной обстановке.' }
  ],
  // Опции для Выездных мероприятий
  events: [
    { id: 'out_of_mkad', name: 'Выезд за МКАД', price: 3000, icon: '🚗', desc: 'Доплата за выезд за пределы МКАД.' },
    { id: 'extra_actor', name: 'Дополнительный актёр', price: 2500, icon: '🎭', desc: 'Ещё один актёр для более насыщенного сюжета.' },
    { id: 'video', name: 'Видео-нарезка', price: 3000, icon: '🎥', desc: 'Профессиональная видео-нарезка самых ярких моментов.' },
    { id: 'photographer', name: 'Фотограф', price: 4000, icon: '📸', desc: 'Профессиональный фотограф для вашего мероприятия.' },
    { id: 'decor', name: 'Декор помещения', price: 3500, icon: '🎈', desc: 'Тематическое украшение помещения для вашего праздника.' }
  ]
};

// ===== АДРЕСА ЛОКАЦИЙ =====
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
  const coords = {
    'м. Профсоюзная': '55.6705,37.5628',
    'Профсоюзная': '55.6705,37.5628',
    'м. Таганская': '55.743260, 37.661557',
    'Таганская': '55.743260, 37.661557',
    'м. Измайловская': '55.7804,37.7492',
    'Измайловская': '55.7804,37.7492'
  };
  const coord = coords[location] || '55.7558,37.6173';
  return `https://yandex.ru/map-widget/v1/?ll=${coord}&z=15&pt=${coord}&l=map`;
}

// ===== TOAST =====
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

// ===== ПОЛУЧЕНИЕ ТИПА БРОНИРОВАНИЯ =====
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

// ===== ПОЛУЧЕНИЕ ОПЦИЙ ПО ТИПУ =====
function getOptionsByType(type) {
  switch(type) {
    case 'amongus':
      return bookingOptions.amongus;
    case 'horror':
      return bookingOptions.horror;
    case 'events':
      return bookingOptions.events;
    default:
      return bookingOptions.default;
  }
}

// ===== ПОЛУЧЕНИЕ ФОТО ДЛЯ КВЕСТА =====
function getQuestPhotos(questName) {
  if (questName.includes('Пакет') || questName.includes('Свой пакет')) {
    for (const [key, photos] of Object.entries(packagePhotos)) {
      if (questName.includes(key)) {
        return photos;
      }
    }
    return ['🎂', '🎁', '🎈'];
  }
  const quest = questsData.find(q => q.name === questName);
  if (quest && quest.photos) {
    return quest.photos;
  }
  return ['🎭', '🔮', '✨'];
}

// ===== ОБНОВЛЕНИЕ ФОТО В БРОНИРОВАНИИ =====
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

// ===== ОТКРЫТИЕ БРОНИРОВАНИЯ =====
function openBooking(name, desc, price, isPackage) {
  document.querySelectorAll('.page-overlay').forEach(el => el.classList.remove('open'));
  
  isPackageBooking = isPackage || false;
  currentBookingName = name;
  currentBookingDesc = desc || '';
  currentBookingPrice = price || 3500;
  
  const overlay = document.getElementById('bookingOverlay');
  if (!overlay) return;
  
  document.getElementById('bookQuestName').textContent = name;
  document.getElementById('bookQuestDesc').textContent = desc || 'Погрузитесь в атмосферу приключения!';
  document.getElementById('bookingPriceDisplay').textContent = price || 3500;
  
  updateBookingPhotos(name);
  
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear = now.getFullYear();
  selectedDate = null;
  
  renderCalendar(currentMonth, currentYear);
  
  bookingPlayersValue = 4;
  document.getElementById('bookingPlayersDisplay').textContent = '4';
  
  // ===== ОПРЕДЕЛЯЕМ ТИП БРОНИРОВАНИЯ =====
  const bookingType = getBookingType(name);
  const isPackageBookingNow = bookingType === 'package';
  
  // ===== ПОЛУЧАЕМ ОПЦИИ ДЛЯ ТИПА =====
  const optionsForType = getOptionsByType(bookingType);
  
  const optionsGrid = document.getElementById('optionsGrid');
  const packagesCollapsible = document.getElementById('packagesCollapsible');
  const packageQuestSelect = document.getElementById('packageQuestSelect');
  const optionsTitle = document.querySelector('.step-content[data-step="2"] h3');
  
  // ===== ДОБАВЛЯЕМ АДРЕС И КАРТУ =====
  const quest = questsData.find(q => q.name === name);
  let location = quest ? quest.loc : '';
  const address = getLocationAddress(location);
  const mapUrl = getMapUrl(location);
  
  // Добавляем адрес в мета-информацию
  const metaContainer = document.querySelector('.booking-info .meta');
  if (metaContainer) {
    // Удаляем старый адрес если есть
    const oldAddress = metaContainer.querySelector('.booking-address');
    if (oldAddress) oldAddress.remove();
    
    const addressSpan = document.createElement('span');
    addressSpan.className = 'booking-address';
    addressSpan.innerHTML = `📍 ${location}: ${address}`;
    addressSpan.style.cssText = 'width:100%; margin-top:4px; font-size:0.75rem; color:#b388ff;';
    metaContainer.appendChild(addressSpan);
  }
  
  // Добавляем карту
  const mapContainer = document.getElementById('bookingMap');
  if (mapContainer) {
    mapContainer.innerHTML = `
      <iframe 
        src="${mapUrl}" 
        width="100%" 
        height="200" 
        style="border:none; border-radius:12px; margin-top:12px;"
        allowfullscreen
      ></iframe>
    `;
  }
  
  if (isPackageBookingNow) {
    // === ПАКЕТ (ДЕНЬ РОЖДЕНИЯ) — БЕЗ ОПЦИЙ ===
    if (optionsGrid) {
      optionsGrid.style.display = 'none';
      // Показываем сообщение, что всё включено
      const step2Container = optionsGrid.closest('.step-content');
      if (step2Container) {
        const oldMsg = step2Container.querySelector('.package-message');
        if (oldMsg) oldMsg.remove();
        
        const msg = document.createElement('div');
        msg.className = 'package-message';
        msg.style.cssText = `
          text-align: center;
          padding: 30px 20px;
          background: #13101e;
          border-radius: 16px;
          border: 1px solid rgba(124, 77, 255, 0.1);
          margin: 10px 0;
        `;
        msg.innerHTML = `
          <div style="font-size: 3rem; margin-bottom: 10px;">🎉</div>
          <div style="font-size: 1.1rem; font-weight: 600; color: #b388ff;">У вас уже всё выбрано!</div>
          <div style="font-size: 0.85rem; color: #9288b0; margin-top: 4px;">Все опции включены в ваш пакет</div>
        `;
        step2Container.prepend(msg);
      }
    }
    if (optionsTitle) optionsTitle.style.display = 'none';
    if (packagesCollapsible) packagesCollapsible.style.display = 'none';
    
    // === ВЫБОР КВЕСТА С ТРЁМЯ ЛОКАЦИЯМИ ===
    if (packageQuestSelect) {
      packageQuestSelect.style.display = 'block';
      const select = document.getElementById('packageQuestChoice');
      if (select) {
        select.innerHTML = '';
        
        // Группируем квесты по локациям (без Among Us)
        const locations = {
          '📍 Профсоюзная': questsData.filter(q => q.loc === 'м. Профсоюзная' && q.name !== 'Among Us'),
          '📍 Таганская': questsData.filter(q => q.loc === 'м. Таганская' && q.name !== 'Among Us'),
          '📍 Измайловская': questsData.filter(q => q.loc === 'м. Измайловская' && q.name !== 'Among Us')
        };
        
        // Добавляем опции с группировкой по локациям
        Object.keys(locations).forEach(locLabel => {
          const quests = locations[locLabel];
          if (quests.length === 0) return;
          
          // Добавляем заголовок локации
          const groupHeader = document.createElement('option');
          groupHeader.value = '';
          groupHeader.textContent = `─── ${locLabel} ───`;
          groupHeader.disabled = true;
          groupHeader.style.cssText = 'color: #7c4dff; font-weight: 600;';
          select.appendChild(groupHeader);
          
          quests.forEach(q => {
            const option = document.createElement('option');
            option.value = q.name;
            option.textContent = `${q.emoji || '🎭'} ${q.name}`;
            select.appendChild(option);
          });
        });
        
        // Если квест есть в списке — выбираем его
        if (questsData.some(q => q.name === name && q.name !== 'Among Us')) {
          select.value = name;
        }
        updateBookingPhotos(select.value);
      }
    }
  } else {
    // === ОБЫЧНОЕ БРОНИРОВАНИЕ ===
    if (packageQuestSelect) {
      packageQuestSelect.style.display = 'none';
    }
    
    // Показываем опции для данного типа
    if (optionsGrid) {
      optionsGrid.style.display = 'grid';
      renderOptions(optionsForType);
    }
    if (optionsTitle) {
      const typeLabels = {
        'amongus': '⚡ Дополнительные опции для Among Us',
        'horror': '🕯️ Дополнительные опции для хоррор-свидания',
        'events': '🚐 Дополнительные услуги для выездного мероприятия',
        'default': '🎯 Дополнительные опции'
      };
      optionsTitle.textContent = typeLabels[bookingType] || typeLabels.default;
      optionsTitle.style.display = 'block';
    }
    
    if (packagesCollapsible) {
      packagesCollapsible.style.display = 'none';
    }
  }
  
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  currentStep = 1;
  goStep(1);
  updateReceipt();
}

// ===== ЗАКРЫТИЕ БРОНИРОВАНИЯ =====
function closeBooking() {
  const overlay = document.getElementById('bookingOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== ШАГИ БРОНИРОВАНИЯ (С ВАЛИДАЦИЕЙ) =====
function goStep(n) {
  if (n === currentStep) return;
  if (n < 1 || n > 4) return;
  
  // === ВАЛИДАЦИЯ ПЕРЕД ПЕРЕХОДОМ ===
  if (n > currentStep) {
    // Проверяем текущий шаг перед переходом вперёд
    if (currentStep === 1) {
      const activeDate = document.querySelector('.date-grid .date-cell.active');
      const activeTime = document.querySelector('.time-slot.active');
      const players = parseInt(document.getElementById('bookingPlayersDisplay').textContent) || 4;
      
      if (!activeDate) {
        showToast('⚠️ Выберите дату!');
        return;
      }
      if (!activeTime) {
        showToast('⚠️ Выберите время!');
        return;
      }
      if (players < 1) {
        showToast('⚠️ Выберите количество участников!');
        return;
      }
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
  
  // Для пакетов: шаги 1 → 2 → 3 (без шага 4)
  const isPackage = currentBookingName.includes('Пакет') || currentBookingName.includes('Свой пакет');
  if (isPackage && n === 4) {
    return;
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

// ===== КАЛЕНДАРЬ =====
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
    updateReceipt();
  }
}

// ===== ГЕНЕРАЦИЯ ВРЕМЕНИ =====
function generateTimeSlots(questName) {
  const grid = document.getElementById('timeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const times = questTimes[questName] || ['09:00', '10:15', '11:30', '12:45', '14:00', '15:15', '16:30', '17:45', '19:00', '20:15', '21:30'];
  const busySlots = ['12:45', '14:00', '18:00', '20:15'];
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  times.forEach(time => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    const isBusy = busySlots.includes(time);
    
    const [hour, minute] = time.split(':').map(Number);
    const isPast = (selectedDate && selectedDate.toDateString() === now.toDateString() &&
      (hour < currentHour || (hour === currentHour && minute <= currentMinute)));
    
    if (isBusy) slot.classList.add('busy');
    if (isPast && !isBusy) slot.classList.add('disabled');
    
    slot.innerHTML = `
      <div class="slot-time">${time}</div>
      <div class="slot-status ${isBusy ? 'busy' : (isPast ? 'прошло' : 'available')}">${isBusy ? 'занято' : (isPast ? 'прошло' : 'доступно')}</div>
    `;
    if (!isBusy && !isPast) {
      slot.addEventListener('click', function() {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
        if (!this.classList.contains('busy') && !this.classList.contains('disabled')) {
          this.classList.add('active');
          updateReceipt();
        }
      });
    }
    grid.appendChild(slot);
  });
}

// ===== ПОЛУЧЕНИЕ ТЕКУЩЕГО КВЕСТА =====
function getCurrentQuestName() {
  const select = document.getElementById('packageQuestChoice');
  if (select && document.getElementById('packageQuestSelect').style.display !== 'none') {
    return select.value;
  }
  return currentBookingName;
}

// ===== РЕНДЕР ОПЦИЙ (С УЛУЧШЕННЫМ ОПИСАНИЕМ) =====
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
      <input type="checkbox" class="option-checkbox" data-price="${opt.price}" data-name="${opt.name}" />
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
      updateReceipt();
    });
    
    container.appendChild(card);
  });
}

// ===== КОНТАКТНЫЕ МЕТОДЫ =====
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

// ===== ОБНОВЛЕНИЕ КВИТАНЦИИ =====
function updateReceipt() {
  const activeDate = document.querySelector('.date-grid .date-cell.active');
  let dateStr = 'Не выбрана';
  let dateObj = new Date();
  if (activeDate) {
    const parts = activeDate.dataset.date.split('-');
    dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    dateStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  
  const activeTime = document.querySelector('.time-slot.active');
  const time = activeTime ? activeTime.querySelector('.slot-time').textContent : '—';
  const players = parseInt(document.getElementById('bookingPlayersDisplay').textContent) || 4;
  
  const bookingType = getBookingType(currentBookingName);
  const isPackage = bookingType === 'package';
  
  let selectedOptions = [];
  let optionNames = '—';
  let optionTotal = 0;
  
  if (!isPackage) {
    selectedOptions = document.querySelectorAll('.option-checkbox:checked');
    optionNames = Array.from(selectedOptions).map(el => el.dataset.name).join(', ') || '—';
    optionTotal = Array.from(selectedOptions).reduce((sum, el) => sum + parseInt(el.dataset.price || 0), 0);
  }
  
  const activeMethod = document.querySelector('.contact-method.active');
  const methodName = activeMethod ? activeMethod.textContent.trim() : 'WhatsApp';
  
  document.getElementById('receiptQuest').textContent = currentBookingName;
  document.getElementById('receiptDateTime').textContent = `${dateStr}, ${time}`;
  document.getElementById('receiptPlayers').textContent = players;
  document.getElementById('receiptExtras').textContent = optionNames;
  document.getElementById('receiptMethod').textContent = methodName;
  
  const total = Math.round((currentBookingPrice + optionTotal) * 0.9);
  document.getElementById('receiptTotal').textContent = `${total} ₽`;
}

// ===== ПОДТВЕРЖДЕНИЕ БРОНИ =====
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

// ===== ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ =====
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('closeOverlayBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeBooking);
  }
  
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
      updateReceipt();
    });
  }
  
  document.addEventListener('change', function(e) {
    if (e.target.closest('.option-checkbox') || e.target.closest('.contact-method') ||
        e.target.closest('.time-slot') || e.target.closest('.date-cell') ||
        e.target.closest('.package-mini') || e.target.id === 'packageQuestChoice') {
      updateReceipt();
    }
  });
  
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const step = parseInt(this.dataset.step);
      // Разрешаем переход только на предыдущие шаги или текущий + 1
      if (step <= currentStep + 1 && step >= 1) {
        goStep(step);
      }
    });
  });
  
  initBookingPhotos();
});

// ===== КАРУСЕЛЬ ФОТО В БРОНИРОВАНИИ =====
function initBookingPhotos() {
  const track = document.getElementById('bookingPhotosTrack');
  const slides = track ? track.querySelectorAll('.booking-photos-slide') : [];
  const prevBtn = document.getElementById('photosPrev');
  const nextBtn = document.getElementById('photosNext');
  
  if (slides.length === 0) return;
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      goToBookingPhoto(currentBookingPhotoIndex - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      goToBookingPhoto(currentBookingPhotoIndex + 1);
    });
  }
}

// ===== ИЗМЕНЕНИЕ КОЛИЧЕСТВА УЧАСТНИКОВ =====
function changeBookingPlayers(delta) {
  bookingPlayersValue = Math.max(1, Math.min(20, bookingPlayersValue + delta));
  const display = document.getElementById('bookingPlayersDisplay');
  if (display) display.textContent = bookingPlayersValue;
  updateReceipt();
}

// ===== ПАКЕТЫ НА ГЛАВНОЙ =====
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

// ===== ИЗМЕНЕНИЕ КОЛИЧЕСТВА В КОНСТРУКТОРЕ =====
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

// ===== ДЛЯ ВСЕХ СТРАНИЦ: КНОПКИ БРОНИРОВАНИЯ =====
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn-book-sm');
  if (!btn) return;
  
  const name = btn.dataset.questName || btn.dataset.package || 'Квест';
  const price = parseInt(btn.dataset.price || btn.dataset.questPrice || 3500);
  const desc = btn.dataset.questDesc || 'Погрузитесь в атмосферу приключения!';
  
  e.preventDefault();
  openBooking(name, desc, price, !!btn.dataset.package);
});