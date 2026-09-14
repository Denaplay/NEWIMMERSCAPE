(function initCookieConsent() {
  'use strict';

  const consentName = 'immerscape_cookie_consent';
  const acceptedValue = 'accepted';
  const storageKey = 'immerscape.cookie-consent';
  const yandexMetrikaCounterIds = [105721762, 98900241, 100756440];

  function initializeYandexMetrika() {
    window.ym = window.ym || function() { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = window.ym.l || Date.now();

    if (!document.querySelector('script[data-yandex-metrika]')) {
      const metrikaScript = document.createElement('script');
      metrikaScript.async = true;
      metrikaScript.src = 'https://mc.yandex.ru/metrika/tag.js';
      metrikaScript.dataset.yandexMetrika = 'true';
      document.head.appendChild(metrikaScript);
    }

    window.__immerscapeMetrikaCounters = window.__immerscapeMetrikaCounters || {};
    yandexMetrikaCounterIds.forEach(counterId => {
      if (window.__immerscapeMetrikaCounters[counterId]) return;
      window.__immerscapeMetrikaCounters[counterId] = true;
      window.ym(counterId, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: false
      });
    });
  }

  function getCookie(name) {
    const prefix = `${name}=`;
    const item = document.cookie
      .split(';')
      .map(value => value.trim())
      .find(value => value.startsWith(prefix));
    if (!item) return '';
    try { return decodeURIComponent(item.slice(prefix.length)); } catch (_error) { return ''; }
  }

  function setCookie(name, value, maxAge) {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    const lifetime = Number.isFinite(maxAge) ? `; Max-Age=${maxAge}` : '';
    document.cookie = `${name}=${encodeURIComponent(value)}${lifetime}; Path=/; SameSite=Lax${secure}`;
  }

  function createAnonymousId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  }

  function initializeSiteCookies() {
    const oneYear = 365 * 24 * 60 * 60;
    const now = new Date().toISOString();
    if (!getCookie('immerscape_visitor_id')) setCookie('immerscape_visitor_id', createAnonymousId(), oneYear);
    if (!getCookie('immerscape_session_id')) setCookie('immerscape_session_id', createAnonymousId());
    if (!getCookie('immerscape_first_visit')) setCookie('immerscape_first_visit', now, oneYear);

    const previousPageViews = Number.parseInt(getCookie('immerscape_page_views'), 10);
    const pageViews = Number.isFinite(previousPageViews) ? previousPageViews + 1 : 1;
    setCookie('immerscape_page_views', String(pageViews), oneYear);
    setCookie('immerscape_last_visit', now, oneYear);
    initializeYandexMetrika();
  }

  function hasConsent() {
    const cookieAccepted = document.cookie
      .split(';')
      .map(value => value.trim())
      .some(value => value === `${consentName}=${acceptedValue}`);
    if (cookieAccepted) return true;
    try { return localStorage.getItem(storageKey) === acceptedValue; } catch (_error) { return false; }
  }

  function saveConsent() {
    setCookie(consentName, acceptedValue, 365 * 24 * 60 * 60);
    try { localStorage.setItem(storageKey, acceptedValue); } catch (_error) { /* Cookie остаётся основным хранилищем. */ }
  }

  function showBanner() {
    if (hasConsent()) {
      initializeSiteCookies();
      return;
    }
    if (document.querySelector('.cookie-consent')) return;

    if (!document.querySelector('link[data-cookie-consent-styles]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/css/cookie-consent.css';
      stylesheet.dataset.cookieConsentStyles = 'true';
      document.head.appendChild(stylesheet);
    }

    const banner = document.createElement('section');
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Согласие на использование файлов cookie');
    banner.innerHTML = `
      <div class="cookie-consent-text">
        <strong>Используем куки, чтобы сайт работал лучше.</strong>
        <span>Оставаясь с нами, вы соглашаетесь на использование файлов куки.</span>
      </div>
      <button class="cookie-consent-button" type="button">Ок</button>`;
    document.body.appendChild(banner);

    requestAnimationFrame(() => banner.classList.add('is-visible'));
    banner.querySelector('.cookie-consent-button').addEventListener('click', () => {
      saveConsent();
      initializeSiteCookies();
      banner.classList.remove('is-visible');
      window.setTimeout(() => banner.remove(), 220);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner, { once: true });
  else showBanner();
})();
