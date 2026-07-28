// ===== MAIN SCRIPT =====

// ===== ДАННЫЕ КВЕСТОВ =====
const quests = [
  {
    name: 'Стоматология "Новая жизнь"',
    tags: ['страшный', 'интерактив'],
    genre: 'хоррор',
    age: '16+',
    loc: 'м. Профсоюзная',
    time: '60 мин',
    players: '1–6',
    difficulty: '4/5',
    desc: 'Интересные загадки · Страшный',
    price: 6500,
    oldPrice: 7990,
    image: 'imeges/stomatologiya/1.webp'
  },
  {
    name: 'Рик и Морти',
    tags: ['приключения', 'семейный'],
    genre: 'приключения',
    age: '12+',
    loc: 'м. Профсоюзная',
    time: '60 мин',
    players: '1–6',
    difficulty: '3/5',
    desc: 'Путешествие по мультивселенной.',
    price: 6500,
    oldPrice: 7990,
    image: 'imeges/rick-and-morty/1.webp'
  },
  {
    name: 'K-pop: последний стрим',
    tags: ['детектив', 'подростки'],
    genre: 'приключения',
    age: '14+',
    loc: 'м. Профсоюзная',
    time: '75 мин',
    players: '1–8',
    difficulty: '4/5',
    desc: 'Расследуйте исчезновение кумира.',
    price: 5500,
    oldPrice: 8500,
    image: 'imeges/k-pop/1.webp'
  },
  {
    name: 'Запретная дверь',
    tags: ['новинка', 'страшный'],
    genre: 'хоррор',
    age: '14+',
    loc: 'м. Измайловская',
    time: '70 мин',
    players: '1–5',
    difficulty: '5/5',
    desc: 'Таинственная комната с сюрпризами.',
    price: 4990,
    oldPrice: 6990,
    image: 'imeges/zapretnaya-dver/IMG_6979.webp'
  },
  {
    name: 'Изнанка в разуме Векны',
    tags: ['мистика', 'психология'],
    genre: 'хоррор',
    age: '16+',
    loc: 'м. Измайловская',
    time: '80 мин',
    players: '1–6',
    difficulty: '5/5',
    desc: 'Погружение в тёмные лабиринты сознания.',
    price: 5990,
    oldPrice: 7500,
    image: 'imeges/iznananka/Изнанка.webp'
  },
  {
    name: 'Невеста',
    tags: ['страшный', 'интерактив'],
    genre: 'хоррор',
    age: '16+',
    loc: 'м. Таганская',
    time: '60 мин',
    players: '1–6',
    difficulty: '4/5',
    desc: 'Мистический хоррор с живым актёром.',
    price: 5500,
    oldPrice: 7500,
    image: 'imeges/nevesta/1.webp'
  },
  {
    name: 'Хогвартс',
    tags: ['фэнтези', 'для детей'],
    genre: 'детский',
    age: '8+',
    loc: 'м. Таганская',
    time: '60 мин',
    players: '1–7',
    difficulty: '3/5',
    desc: 'Магия и школа чародейства.',
    price: 5500,
    oldPrice: 7500,
    image: 'imeges/rozhdestvo-v-hogvartse/1.webp'
  },
  {
    name: 'Лабубу: волшебный мир',
    tags: ['для детей', 'анимация'],
    genre: 'детский',
    age: '6+',
    loc: 'м. Таганская',
    time: '50 мин',
    players: '1–8',
    difficulty: '2/5',
    desc: 'Сказочное приключение для малышей.',
    price: 5500,
    oldPrice: 7500,
    image: 'imeges/labubu/1.webp'
  },
  {
    name: 'Монастырь',
    tags: ['новинка', 'страшный'],
    genre: 'хоррор',
    age: '16+',
    loc: 'м. Таганская',
    time: '70 мин',
    players: '1–6',
    difficulty: '5/5',
    desc: 'Древний монастырь с мистическими тайнами.',
    price: 5990,
    oldPrice: 7500,
    image: 'imeges/monastyr/1.webp'
  },
  {
    name: 'Гринч',
    tags: ['новинка', 'приключения'],
    genre: 'приключения',
    age: '6+',
    loc: 'м. Таганская',
    time: '55 мин',
    players: '1–8',
    difficulty: '2/5',
    desc: 'Приключение по мотивам любимой истории.',
    price: 5500,
    oldPrice: 7500,
    image: 'imeges/grinch/1.webp'
  },
  {
    name: 'Хоррор-свидание',
    tags: ['романтика', 'хоррор'],
    genre: 'хоррор',
    age: '16+',
    loc: 'м. Профсоюзная',
    time: '60-90 мин',
    players: '1–8',
    difficulty: '4/5',
    desc: 'Романтическое свидание с элементами хоррора.',
    price: 10000,
    oldPrice: 15000,
    image: 'imeges/horror-svidanie/1.webp'
  },
  {
    name: 'Хоррор-вечер',
    tags: ['хоррор', 'мистика'],
    genre: 'хоррор',
    age: '16+',
    loc: 'м. Таганская',
    time: '60-90 мин',
    players: '1–8',
    difficulty: '4/5',
    desc: 'Хоррор вечер для смелых пар.',
    price: 5500,
    oldPrice: 7500,
    image: 'imeges/horror-svidanie/2.webp'
  },
  {
    name: 'Among Us',
    tags: ['экшен', 'игра', 'командная'],
    genre: 'экшен',
    age: '12+',
    loc: 'м. Измайловская',
    time: '60 мин',
    players: '6–10',
    difficulty: '4/5',
    desc: 'Экшн-игра по мотивам популярной вселенной. Найдите предателя!',
    price: 7990,
    oldPrice: 8990,
    image: 'imeges/amongus/1.webp'
  }
];

// ===== РЕНДЕР КВЕСТОВ =====
function renderQuests() {
  const grid = document.getElementById('questGrid');
  if (!grid) return;
  
  const filter = document.querySelector('.location-filter .loc-chip.active');
  const location = filter ? filter.dataset.location : 'all';
  
  const filtered = quests.filter(q => {
    const locMatch = location === 'all' || q.loc === location;
    const notAction = q.genre !== 'экшен' || q.name !== 'Among Us';
    return locMatch && notAction;
  });
  
  grid.innerHTML = '';
  filtered.forEach(q => grid.appendChild(createQuestCard(q)));
}

function createQuestCard(q) {
  const card = document.createElement('div');
  card.className = 'quest-card';
  card.innerHTML = `
<div class="card-image" style="background-image: url('${q.image || ''}'); background-size: cover; background-position: center;">
  <div class="image-tags" style="position:absolute; top:8px; left:8px; z-index:2;">
    ${q.tags.map(t => `<span class="tag ${t === 'новинка' ? 'highlight' : ''}">${t}</span>`).join('')}
  </div>
  ${!q.image ? `<span class="image-emoji">${q.emoji || '🎭'}</span>` : ''}
</div>
    <div class="card-body">
      <div class="card-title">${q.name}</div>
      <div class="card-location">📍 ${q.loc}</div>
      <div class="card-meta">
        <span>⏱ ${q.time}</span>
        <span>👥 ${q.players}</span>
        <span>⚡ ${q.difficulty}</span>
        <span>🎂 ${q.age}</span>
      </div>
      <div class="card-desc">${q.desc}</div>
    </div>
    <div class="card-footer">
      <span class="price">от ${q.price} ₽ <small>${q.oldPrice} ₽</small></span>
      <button class="btn-book-sm" data-quest-name="${escapeAttr(q.name)}" data-quest-desc="${escapeAttr(q.desc)}" data-quest-price="${q.price}">Забронировать</button>
    </div>
  `;
  const btn = card.querySelector('.btn-book-sm');
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const name = this.dataset.questName;
    const desc = this.dataset.questDesc;
    const price = parseInt(this.dataset.questPrice);
    openBooking(name, desc, price, false);
  });
  return card;
}

// ===== ФИЛЬТР ПО ЛОКАЦИЯМ =====
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.location-filter .loc-chip').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.location-filter .loc-chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      renderQuests();
    });
  });
  
  renderQuests();
});

// ===== HERO CAROUSEL =====
(function initHeroPhoto() {
  const slides = document.querySelectorAll('.hero-photo-card .photo-slide');
  const dots = document.querySelectorAll('.hero-photo-card .photo-dot');
  const prevBtn = document.querySelector('.hero-photo-prev');
  const nextBtn = document.querySelector('.hero-photo-next');
  let current = 0;
  let interval = null;
  
  if (slides.length === 0) return;
  
  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    current = index;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }
  
  function next() { goTo(current + 1); }
  function startAutoplay() { if (interval) clearInterval(interval); interval = setInterval(next, 4000); }
  function stopAutoplay() { if (interval) { clearInterval(interval); interval = null; } }
  
  if (prevBtn) prevBtn.addEventListener('click', function() { stopAutoplay(); goTo(current - 1); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function() { stopAutoplay(); goTo(current + 1); startAutoplay(); });
  
  dots.forEach(dot => {
    dot.addEventListener('click', function() { stopAutoplay(); goTo(parseInt(this.dataset.index)); startAutoplay(); });
  });
  
  const card = document.querySelector('.hero-photo-card');
  if (card) {
    card.addEventListener('mouseenter', stopAutoplay);
    card.addEventListener('mouseleave', startAutoplay);
  }
  
  startAutoplay();
})();

// ===== ATMOSPHERE CAROUSEL =====
(function initAtmosphereCarousel() {
  const track = document.getElementById('atmosphereCarouselTrack');
  const slides = track ? track.querySelectorAll('.atmosphere-carousel-slide') : [];
  const dotsContainer = document.getElementById('atmosphereCarouselDots');
  const prevBtn = document.querySelector('.atmo-prev');
  const nextBtn = document.querySelector('.atmo-next');
  let current = 0;
  let interval = null;
  
  if (slides.length === 0 || !dotsContainer) return;
  
  function createDots() {
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'atmosphere-carousel-dot' + (i === 0 ? ' active' : '');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }
  
  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    current = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.atmosphere-carousel-dot').forEach((dot, i) => dot.classList.toggle('active', i === index));
  }
  
  function next() { goTo(current + 1); }
  function startAutoplay() { if (interval) clearInterval(interval); interval = setInterval(next, 4000); }
  function stopAutoplay() { if (interval) { clearInterval(interval); interval = null; } }
  
  if (prevBtn) prevBtn.addEventListener('click', function() { stopAutoplay(); goTo(current - 1); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function() { stopAutoplay(); goTo(current + 1); startAutoplay(); });
  
  const wrapper = document.querySelector('.atmosphere-carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAutoplay);
    wrapper.addEventListener('mouseleave', startAutoplay);
  }
  
  createDots();
  startAutoplay();
})();

// ===== PHONE BUTTON =====
document.addEventListener('DOMContentLoaded', function() {
  // Все элементы с data-phone
  document.querySelectorAll('[data-phone]').forEach(el => {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      const phone = this.dataset.phone;
      if (phone) {
        copyPhoneNumber(phone);
      }
    });
  });
});

// ===== КОПИРОВАНИЕ НОМЕРА ТЕЛЕФОНА =====
function copyPhoneNumber(phone) {
  // Убираем все лишние символы, оставляем только цифры и +
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cleanPhone).then(() => {
      showToast('✅ Номер скопирован!');
    }).catch(() => {
      fallbackCopyPhone(cleanPhone);
    });
  } else {
    fallbackCopyPhone(cleanPhone);
  }
}

function fallbackCopyPhone(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('✅ Номер скопирован!');
  } catch (e) {
    showToast('❌ Не удалось скопировать');
  }
  document.body.removeChild(textarea);
}

// ===== MOBILE HEADER =====
document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.header');
  if (!header) return;

  const headerContainer = header.querySelector('.container');
  const logo = header.querySelector('.logo');
  const nav = header.querySelector('.nav');
  if (!headerContainer || !logo || !nav) return;

  let toggle = header.querySelector('.mobile-menu-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-menu-toggle';
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span class="menu-icon" aria-hidden="true"></span>';
    logo.insertAdjacentElement('afterend', toggle);
  }

  function closeMenu() {
    header.classList.remove('mobile-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  function toggleMenu() {
    const isOpen = header.classList.toggle('mobile-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function(e) {
    if (!header.classList.contains('mobile-open')) return;
    if (!header.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) closeMenu();
  });
});

// ===== GLOW LINE =====
function updateGlowLine() {
  const line = document.getElementById('glowLine');
  if (!line) return;
  
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
  
  const colors = [
    { pos: 0, r: 124, g: 77, b: 255 },
    { pos: 0.25, r: 179, g: 136, b: 255 },
    { pos: 0.5, r: 255, g: 110, b: 199 },
    { pos: 0.75, r: 100, g: 200, b: 255 },
    { pos: 1, r: 124, g: 77, b: 255 }
  ];
  
  for (let i = 0; i < colors.length - 1; i++) {
    const c1 = colors[i];
    const c2 = colors[i + 1];
    if (progress >= c1.pos && progress <= c2.pos) {
      const t = (progress - c1.pos) / (c2.pos - c1.pos);
      const r = Math.round(c1.r + (c2.r - c1.r) * t);
      const g = Math.round(c1.g + (c2.g - c1.g) * t);
      const b = Math.round(c1.b + (c2.b - c1.b) * t);
      const color1 = `rgb(${c1.r},${c1.g},${c1.b})`;
      const color2 = `rgb(${c2.r},${c2.g},${c2.b})`;
      const mainColor = `rgb(${r},${g},${b})`;
      const gradient = `linear-gradient(90deg, ${color1}, ${mainColor} 40%, ${mainColor} 60%, ${color2})`;
      line.style.background = gradient;
      line.style.backgroundSize = '100% 100%';
      break;
    }
  }
}

window.addEventListener('scroll', updateGlowLine);
window.addEventListener('load', updateGlowLine);

// ===== КОНСТРУКТОР НА ГЛАВНОЙ =====
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.constructor-options .option-card').forEach(el => {
    el.addEventListener('click', function() {
      this.classList.toggle('active');
      updateConstructor();
    });
  });
  updateConstructor();
});

// ===== АКТИВНАЯ НАВИГАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.remove('active');
    if (href === currentPath || (href === 'index.html' && currentPath === 'index.html')) {
      link.classList.add('active');
    }
    if (currentPath === 'index.html' && href === 'index.html#section-quests') {
      link.classList.add('active');
    }
  });
});

// ===== ПЛАВНЫЕ ПЕРЕХОДЫ МЕЖДУ СТРАНИЦАМИ =====
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.endsWith('.html') || href.includes('.html#')) && !href.startsWith('http') && !href.startsWith('#')) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.add('page-transition');
        setTimeout(() => {
          window.location.href = this.getAttribute('href');
        }, 300);
      });
    }
  });
  
  document.body.classList.remove('page-transition');
});

// ===== ЭКШЕН ИГРЫ =====
document.addEventListener('DOMContentLoaded', function() {
  const actionGrid = document.getElementById('actionGrid');
  if (actionGrid) {
    const actionQuests = quests.filter(q => q.genre === 'экшен' || q.name === 'Among Us');
    actionGrid.innerHTML = '';
    actionQuests.forEach(q => actionGrid.appendChild(createQuestCard(q)));
    if (actionQuests.length === 0) {
      actionGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#6f648a; padding:40px 0;">Скоро здесь появятся новые экшен-игры!</div>`;
    }
  }
});

// ===== КОПИРОВАНИЕ ПРОМОКОДА =====
function copyPromoCode() {
  const promoCode = 'КВЕСТ10';
  const btn = document.querySelector('.promo-code-btn');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(promoCode).then(() => {
      showCopyTooltip(btn, '✅ Скопировано!');
    }).catch(() => {
      fallbackCopy(promoCode, btn);
    });
  } else {
    fallbackCopy(promoCode, btn);
  }
}

function fallbackCopy(text, btn) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showCopyTooltip(btn, '✅ Скопировано!');
  } catch (e) {
    showCopyTooltip(btn, '❌ Не удалось скопировать');
  }
  document.body.removeChild(textarea);
}

function showCopyTooltip(btn, message) {
  let tooltip = btn.querySelector('.copy-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('span');
    tooltip.className = 'copy-tooltip';
    btn.appendChild(tooltip);
  }
  tooltip.textContent = message;
  tooltip.classList.add('show');
  
  clearTimeout(tooltip._hideTimer);
  tooltip._hideTimer = setTimeout(() => {
    tooltip.classList.remove('show');
    setTimeout(() => {
      tooltip.textContent = '📋 Скопировать';
    }, 300);
  }, 2000);
}
