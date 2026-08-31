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
    social.innerHTML = '<a href="https://t.me/immerScape1" title="Telegram" aria-label="Telegram Immerscape"><img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="" width="30" height="30"></a>';
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

    let social = header.querySelector('.social-icons');
    if (!social) {
      social = createTelegramLink();
      headerRight.appendChild(social);
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
