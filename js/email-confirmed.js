(function initEmailConfirmationPage() {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  if (window.location.hash.length > 1) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    hashParams.forEach((value, key) => params.set(key, value));
  }

  const error = params.get('error_description') || params.get('error');
  if (error) {
    const card = document.querySelector('.confirmation-card');
    card.classList.add('is-error');
    document.querySelector('.confirmation-kicker').textContent = 'Подтверждение не выполнено';
    document.getElementById('confirmationTitle').textContent = 'Ссылка недействительна';
    document.getElementById('confirmationText').textContent = 'Ссылка подтверждения устарела или уже была использована. Запросите новое письмо в форме входа.';
    document.getElementById('confirmationAction').textContent = 'Перейти к форме входа';
  }

  // Убираем токены и служебные параметры Supabase из адресной строки.
  window.history.replaceState(null, '', window.location.pathname);
})();
