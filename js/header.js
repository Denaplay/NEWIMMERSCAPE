(function () {
  'use strict';

  const MENU_ITEMS = [
    { label: 'Квесты', href: '/#section-quests', path: '/' },
    { label: 'День рождения под ключ', href: '/#section-birthday', path: '/birthday' },
    { label: 'Хоррор вечер', href: '/horror', path: '/horror' },
    { label: 'Экшен игры', href: '/action', path: '/action' }
  ];

  function createTelegramLink() {
    const social = document.createElement('div');
    social.className = 'social-icons mobile-header-social';
    social.innerHTML = '<a href="https://t.me/immerScape1" target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram Immerscape"><img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="" width="30" height="30"></a>';
    return social;
  }

  function createMobileProfileButton(header, headerRight) {
    let mobileProfile = header.querySelector('.mobile-profile-button');
    if (mobileProfile) return mobileProfile;

    mobileProfile = document.createElement('button');
    mobileProfile.type = 'button';
    mobileProfile.className = 'mobile-profile-button';
    mobileProfile.textContent = 'В';
    mobileProfile.setAttribute('aria-label', 'Войти или зарегистрироваться');
    mobileProfile.title = 'Войти или зарегистрироваться';
    headerRight.appendChild(mobileProfile);
    return mobileProfile;
  }

  function copyPhone(link) {
    const phone = link.textContent.replace(/[^0-9+]/g, '');
    let copyPromise;
    if (navigator.clipboard?.writeText) {
      copyPromise = navigator.clipboard.writeText(phone);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = phone;
      textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        copyPromise = document.execCommand('copy') ? Promise.resolve() : Promise.reject(new Error('Copy failed'));
      } catch (error) {
        copyPromise = Promise.reject(error);
      }
      textarea.remove();
    }

    copyPromise.then(function () {
      link.dataset.copyLabel = 'Номер скопирован';
    }).catch(function () {
      link.dataset.copyLabel = 'Откроется приложение «Телефон»';
    }).finally(function () {
      window.clearTimeout(link._copyLabelTimer);
      link._copyLabelTimer = window.setTimeout(function () {
        link.dataset.copyLabel = 'Скопировать и позвонить';
      }, 2200);
    });
  }

  function enablePhoneCopy(link) {
    if (link.dataset.phoneCopyReady === 'true') return;
    link.dataset.phoneCopyReady = 'true';
    link.dataset.copyLabel = 'Скопировать и позвонить';
    link.addEventListener('click', function () { copyPhone(link); });
  }

  function initContactLinks(root) {
    root.querySelectorAll('.header-phone').forEach(function (phoneNode) {
      const phone = phoneNode.textContent.replace(/[^0-9+]/g, '');
      if (phoneNode.tagName === 'A') {
        phoneNode.href = 'tel:' + phone;
        enablePhoneCopy(phoneNode);
        return;
      }
      const phoneLink = document.createElement('a');
      phoneLink.className = phoneNode.className;
      phoneLink.href = 'tel:' + phone;
      phoneLink.textContent = phoneNode.textContent;
      phoneNode.replaceWith(phoneLink);
      enablePhoneCopy(phoneLink);
    });

    root.querySelectorAll('.social-icons a, .footer .social-links a').forEach(function (link) {
      if (!/^https?:/i.test(link.href)) return;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });

    root.querySelectorAll('.footer-col span').forEach(function (node) {
      const text = node.textContent.trim();
      let href = '';
      if (/^\+7\s*\(/.test(text)) href = 'tel:' + text.replace(/[^0-9+]/g, '');
      else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) href = 'mailto:' + text;
      if (!href) return;
      const link = document.createElement('a');
      link.className = 'footer-contact-link';
      link.href = href;
      link.textContent = text;
      node.replaceWith(link);
      if (href.startsWith('tel:')) enablePhoneCopy(link);
    });

    root.querySelectorAll('.footer-contact-link[href^="tel:"]').forEach(enablePhoneCopy);
  }

  function enhanceQuestDetailPage() {
    const main = document.querySelector('.quest-detail-main .container');
    const heroImage = document.querySelector('.quest-detail-image');
    const questTitle = document.querySelector('.quest-detail-copy h1');
    const location = document.querySelector('.quest-spec:last-child strong')?.textContent.trim();
    if (!main || !heroImage || document.querySelector('.quest-detail-extras')) return;

    const titleLength = Array.from(questTitle?.textContent.trim() || '').length;
    if (titleLength > 18) questTitle.classList.add('quest-title-long');
    if (titleLength > 27) questTitle.classList.add('quest-title-very-long');

    const wallpaper = document.createElement('div');
    wallpaper.className = 'quest-detail-wallpaper';
    wallpaper.setAttribute('aria-hidden', 'true');
    wallpaper.innerHTML = '<svg viewBox="0 0 1440 900" preserveAspectRatio="none" focusable="false">' +
      '<g class="quest-line-layer layer-a"><path class="quest-flow-line line-a" d="M-220 95 C 10 35 170 230 380 170 S 700 25 920 130 S 1220 330 1660 115"/><path class="quest-flow-line line-f" d="M-230 210 C 40 340 240 40 520 185 S 850 410 1120 250 S 1390 55 1660 195"/><path class="quest-flow-line line-j" d="M-240 335 C 45 210 225 410 500 315 S 850 170 1110 315 S 1390 520 1660 355"/></g>' +
      '<g class="quest-line-layer layer-b"><path class="quest-flow-line line-b" d="M-240 130 C 80 330 265 70 535 205 S 830 460 1115 280 S 1390 80 1680 250"/><path class="quest-flow-line line-g" d="M-260 285 C 20 125 260 520 555 345 S 900 85 1180 300 S 1395 610 1690 420"/><path class="quest-flow-line line-i" d="M-250 600 C 80 430 300 735 590 570 S 940 315 1215 535 S 1450 785 1690 625"/></g>' +
      '<g class="quest-line-layer layer-c"><path class="quest-flow-line line-c" d="M-180 820 C 120 660 220 490 455 400 S 820 350 1010 195 S 1300 80 1600 160"/><path class="quest-flow-line line-e" d="M-190 -20 C 120 130 275 245 480 345 S 760 535 1040 430 S 1330 250 1620 330"/><path class="quest-flow-line line-n" d="M-210 60 C 100 240 230 370 500 475 S 835 660 1090 515 S 1360 290 1640 455"/></g>' +
      '<g class="quest-line-layer layer-d"><path class="quest-flow-line line-d" d="M-240 55 C 60 255 260 5 540 145 S 870 380 1150 190 S 1420 -40 1680 140"/><path class="quest-flow-line line-h" d="M-230 250 C 80 470 255 185 530 290 S 900 520 1160 345 S 1410 130 1670 270"/><path class="quest-flow-line line-p" d="M-240 765 C 35 900 265 700 515 760 S 880 910 1120 805 S 1400 640 1660 720"/></g></svg>';
    document.body.prepend(wallpaper);

    const path = window.location.pathname.replace(/\.html$/, '').replace(/^\//, '');
    const imageCounts = { stomatologiya: 4, 'rick-and-morty': 4, 'k-pop': 3, 'zapretnaya-dver': 3, iznanka: 1, nevesta: 3, 'rozhdestvo-v-hogvartse': 2, labubu: 3, monastyr: 4, grinch: 1, 'horror-svidanie': 2, 'among-us': 1 };
    const imageFolder = { 'among-us': 'amongus', iznanka: 'iznananka' }[path] || path;
    const imageCount = imageCounts[path] || 1;
    const mapUrls = {
      'м. Профсоюзная': 'https://yandex.ru/map-widget/v1/org/imerskeyp/173606417400/?from=mapframe&ll=37.563117%2C55.681585&z=17',
      'м. Таганская': 'https://yandex.ru/map-widget/v1/org/immerscape/229233551571/?from=mapframe&indoorLevel=1&ll=37.659735%2C55.743193&z=17.07',
      'м. Измайловская': 'https://yandex.ru/map-widget/v1/org/immerscape/156364387435/?from=mapframe&ll=37.771090%2C55.791071&z=17.07'
    };
    const address = {
      'м. Профсоюзная': 'ул. Кржижановского, 8, корп. 2',
      'м. Таганская': 'Большой Факельный пер., 2/22',
      'м. Измайловская': 'ул. Первомайская, 5'
    }[location] || 'Москва';
    const photoPaths = Array.from({ length: imageCount }, function (_, index) {
      const src = index === 0 ? heroImage.getAttribute('src') : '/imeges/' + imageFolder + '/' + (index + 1) + '.webp';
      return src;
    });
    const heroCarousel = document.createElement('div');
    heroCarousel.className = 'quest-detail-carousel';
    heroImage.parentNode.insertBefore(heroCarousel, heroImage);
    heroCarousel.appendChild(heroImage);
    if (photoPaths.length > 1) {
      heroCarousel.insertAdjacentHTML('beforeend', '<button class="quest-detail-arrow prev" type="button" aria-label="Предыдущая фотография">‹</button><button class="quest-detail-arrow next" type="button" aria-label="Следующая фотография">›</button><div class="quest-detail-dots">' + photoPaths.map(function (_, index) { return '<button class="quest-detail-dot' + (index === 0 ? ' active' : '') + '" type="button" data-slide="' + index + '" aria-label="Фотография ' + (index + 1) + '"></button>'; }).join('') + '</div>');
    }

    const extras = document.createElement('div');
    extras.className = 'quest-detail-extras';
    extras.innerHTML = '<section class="quest-detail-map" aria-labelledby="mapTitle"><div><h2 id="mapTitle">Как нас найти</h2><p>📍 ' + location + ': ' + address + '</p></div><iframe src="' + (mapUrls[location] || mapUrls['м. Профсоюзная']) + '" title="Карта: ' + address + '" loading="lazy" allowfullscreen></iframe></section>';
    main.appendChild(extras);

    const dots = Array.from(heroCarousel.querySelectorAll('.quest-detail-dot'));
    let activePhoto = 0;
    function showPhoto(index, shouldScroll) {
      activePhoto = (index + photoPaths.length) % photoPaths.length;
      heroImage.classList.add('is-changing');
      window.setTimeout(function () {
        heroImage.src = photoPaths[activePhoto];
        heroImage.classList.remove('is-changing');
      }, 120);
      dots.forEach(function (dot, dotIndex) { dot.classList.toggle('active', dotIndex === activePhoto); });
      if (shouldScroll) heroCarousel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    heroCarousel.querySelector('.quest-detail-arrow.prev')?.addEventListener('click', function () { showPhoto(activePhoto - 1, false); });
    heroCarousel.querySelector('.quest-detail-arrow.next')?.addEventListener('click', function () { showPhoto(activePhoto + 1, false); });
    dots.forEach(function (dot) { dot.addEventListener('click', function () { showPhoto(Number(dot.dataset.slide), false); }); });
  }

  function normalizeQuestDetailHeader(header) {
    if (!document.body.classList.contains('quest-detail-page')) return;
    const nav = header.querySelector('.nav');
    if (nav) {
      nav.innerHTML = '<a href="/#section-quests">Квесты</a><a href="/#section-birthday">День рождения под ключ</a><a href="/horror">Хоррор вечер</a><a href="/action">Экшен игры</a>';
    }
    const headerRight = header.querySelector('.header-right');
    if (headerRight && !headerRight.querySelector('.account-button')) {
      const account = document.createElement('button');
      account.type = 'button';
      account.className = 'account-button auth-trigger';
      account.textContent = 'Войти';
      account.addEventListener('click', function () { window.location.href = '/profile.html'; });
      headerRight.appendChild(account);
    }
  }

  function replaceQuestBreadcrumbs() {
    const breadcrumbs = document.querySelector('.quest-detail-page .quest-breadcrumbs');
    if (!breadcrumbs || breadcrumbs.dataset.backButtonReady === 'true') return;
    breadcrumbs.dataset.backButtonReady = 'true';
    breadcrumbs.innerHTML = '<button type="button" class="quest-back-button" aria-label="Вернуться назад">← Назад</button>';
    breadcrumbs.querySelector('.quest-back-button').addEventListener('click', function () {
      const sameSiteReferrer = document.referrer && new URL(document.referrer).origin === window.location.origin;
      if (sameSiteReferrer && window.history.length > 1) window.history.back();
      else window.location.href = '/#section-quests';
    });
  }

  function connectMobileProfile(header, headerRight) {
    const mobileProfile = createMobileProfileButton(header, headerRight);
    const desktopProfile = header.querySelector('.account-button, .auth-trigger');

    function syncProfile() {
      const label = desktopProfile?.textContent?.trim() || 'Профиль';
      const signedIn = desktopProfile?.classList.contains('signed-in');
      const letterSource = signedIn ? label : 'Войти';
      const letter = Array.from(letterSource)[0] || 'П';
      mobileProfile.textContent = letter.toLocaleUpperCase('ru-RU');
      mobileProfile.classList.toggle('signed-in', Boolean(signedIn));
      mobileProfile.title = signedIn ? 'Открыть профиль: ' + label : 'Войти или зарегистрироваться';
      mobileProfile.setAttribute('aria-label', mobileProfile.title);
    }

    syncProfile();

    if (desktopProfile) {
      const observer = new MutationObserver(syncProfile);
      observer.observe(desktopProfile, { attributes: true, childList: true, characterData: true, subtree: true });
    }

    mobileProfile.addEventListener('click', function () {
      if (typeof window.openImmerscapeAuth === 'function') window.openImmerscapeAuth();
      else window.location.href = '/profile.html';
    });
  }

  function initHeader() {
    const header = document.querySelector('.header');
    if (!header || header.dataset.mobileHeaderReady === 'true') return;

    const headerContainer = header.querySelector('.container');
    const logo = header.querySelector('.logo');
    const headerRight = header.querySelector('.header-right');
    if (!headerContainer || !logo || !headerRight) return;

    header.dataset.mobileHeaderReady = 'true';
    normalizeQuestDetailHeader(header);
    replaceQuestBreadcrumbs();
    initContactLinks(document);
    enhanceQuestDetailPage();

    let social = header.querySelector('.social-icons');
    if (!social) {
      social = createTelegramLink();
      headerRight.insertBefore(social, headerRight.querySelector('.account-button'));
    }

    connectMobileProfile(header, headerRight);

    let toggle = header.querySelector('.mobile-menu-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'mobile-menu-toggle';
      toggle.innerHTML = '<span class="menu-icon" aria-hidden="true"></span>';
      logo.insertAdjacentElement('afterend', toggle);
    }

    const panel = document.createElement('aside');
    panel.className = 'mobile-menu-panel';
    panel.id = 'mobile-menu-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Меню сайта');

    const currentPath = window.location.pathname.replace(/\.html$/, '') || '/';
    const links = MENU_ITEMS.map(function (item) {
      const active = item.path === '/' ? currentPath === '/' : currentPath === item.path;
      return '<a href="' + item.href + '"' + (active ? ' class="active" aria-current="page"' : '') + '>' + item.label + '</a>';
    }).join('');

    panel.innerHTML = '<nav class="mobile-menu-links">' + links + '</nav>' +
      '<a class="mobile-menu-phone" href="tel:+79916858651"><span>Позвонить</span><strong>+7 (991) 685-86-51</strong></a>';
    document.body.appendChild(panel);

    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Открыть меню');

    let closeTimer = null;

    function closeMenu() {
      if (closeTimer) window.clearTimeout(closeTimer);
      document.body.classList.remove('mobile-menu-open');
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Открыть меню');
      closeTimer = window.setTimeout(function () {
        if (!panel.classList.contains('is-open')) panel.hidden = true;
      }, 180);
    }

    function openMenu() {
      if (closeTimer) window.clearTimeout(closeTimer);
      panel.hidden = false;
      document.body.classList.add('mobile-menu-open');
      window.requestAnimationFrame(function () { panel.classList.add('is-open'); });
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Закрыть меню');
    }

    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      if (panel.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (event) {
      if (!panel.classList.contains('is-open')) return;
      if (!panel.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
})();
