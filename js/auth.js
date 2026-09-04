(function initSupabaseAuth() {
  'use strict';

  const config = window.IMMERSCAPE_SUPABASE_CONFIG;
  const authLibrary = window.supabase || window.ImmerscapeSupabaseAuth;
  const headerRight = document.querySelector('.header-right');
  if (!headerRight) return;

  const button = headerRight.querySelector('.auth-trigger');
  if (!button) return;
  button.classList.add('account-button');

  let client = null;
  let initializationError = '';
  try {
    if (!config || !authLibrary) throw new Error('Клиент или настройки Supabase не загружены.');
    client = authLibrary.createClient(config.url, config.publishableKey);
  } catch (error) {
    initializationError = error.message || 'Не удалось запустить авторизацию.';
    console.error('Supabase Auth:', error);
  }

  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="auth-backdrop" data-auth-close></div>
    <section class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <button class="auth-close" type="button" aria-label="Закрыть" data-auth-close>×</button>
      <div class="auth-brand">immerscape</div>
      <h2 id="authTitle">Вход в аккаунт</h2>
      <p class="auth-subtitle">Войдите, чтобы пользоваться личным аккаунтом</p>
      <form class="auth-form">
        <div class="auth-signup-fields" hidden>
          <label>Имя и фамилия<input name="fullName" type="text" autocomplete="name" maxlength="100" placeholder="Иван Иванов"></label>
          <label>Телефон<input name="phone" type="tel" autocomplete="tel" inputmode="numeric" maxlength="18" value="+7 " placeholder="+7 (999) 000-00-00"></label>
        </div>
        <label>Email<input name="email" type="email" autocomplete="email" placeholder="mail@example.com" required></label>
        <label class="auth-password-field">Пароль<input name="password" type="password" autocomplete="current-password" minlength="6" placeholder="Не менее 6 символов" required></label>
        <label class="auth-confirm-field" hidden>Повторите пароль<input name="passwordConfirm" type="password" autocomplete="new-password" minlength="6" placeholder="Повторите пароль"></label>
        <label class="auth-consent" hidden><input name="consent" type="checkbox"> <span>Я согласен на обработку персональных данных</span></label>
        <div class="auth-message" role="status" aria-live="polite"></div>
        <button class="auth-submit" type="submit">Войти</button>
        <button class="auth-resend auth-link" type="button" hidden>Отправить письмо подтверждения ещё раз</button>
      </form>
      <button class="auth-link auth-reset" type="button">Забыли пароль?</button>
      <div class="auth-switch">Нет аккаунта? <button class="auth-link auth-mode" type="button">Зарегистрироваться</button></div>
    </section>`;
  document.body.appendChild(modal);

  const form = modal.querySelector('.auth-form');
  const title = modal.querySelector('#authTitle');
  const subtitle = modal.querySelector('.auth-subtitle');
  const submit = modal.querySelector('.auth-submit');
  const modeButton = modal.querySelector('.auth-mode');
  const switchText = modal.querySelector('.auth-switch');
  const resetButton = modal.querySelector('.auth-reset');
  const message = modal.querySelector('.auth-message');
  const resendButton = modal.querySelector('.auth-resend');
  const passwordInput = form.elements.password;
  const signupFields = modal.querySelector('.auth-signup-fields');
  const confirmField = modal.querySelector('.auth-confirm-field');
  const consentField = modal.querySelector('.auth-consent');
  let mode = 'signin';
  let currentUser = null;
  const authTimeoutMs = 20000;
  const signupConfirmationMessage = 'Вы зарегистрированы! Теперь нажмите кнопку Войти.';

  function withTimeout(operation) {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error('Сервер авторизации не ответил за 20 секунд. Проверьте настройки SMTP в Supabase.');
        error.code = 'auth_timeout';
        reject(error);
      }, authTimeoutMs);
    });
    return Promise.race([operation, timeout]).finally(() => clearTimeout(timeoutId));
  }

  function getErrorMessage(error) {
    if (!error) return 'Неизвестная ошибка авторизации.';
    const isUsefulText = value => {
      if (typeof value !== 'string') return false;
      const normalized = value.trim();
      return normalized && normalized !== '{}' && normalized !== '[]' && normalized !== '[object Object]';
    };
    const rawMessage = [error, error.message, error.error_description, error.msg]
      .find(isUsefulText);
    const message = String(rawMessage || '').trim();
    const normalized = `${error.code || ''} ${error.name || ''} ${message}`.toLowerCase();

    const translations = [
      [/auth_timeout|timed out|timeout|aborted/, 'Сервер авторизации не ответил вовремя. Попробуйте ещё раз.'],
      [/failed to fetch|networkerror|network request failed|fetch failed|load failed/, 'Нет связи с сервером авторизации. Проверьте интернет и попробуйте ещё раз.'],
      [/invalid_credentials|invalid login credentials|invalid email or password/, 'Неверный email или пароль.'],
      [/email_not_confirmed|email not confirmed/, 'Email ещё не подтверждён. Откройте письмо с подтверждением или запросите его повторно.'],
      [/user_already_exists|already registered|already been registered|email exists|email_exists/, 'Пользователь с таким email уже зарегистрирован.'],
      [/weak_password|password should|password must|password is too weak/, 'Пароль слишком простой. Используйте не менее 6 символов.'],
      [/same_password|new password should be different/, 'Новый пароль должен отличаться от текущего.'],
      [/signup_disabled|signups not allowed|signup is disabled/, 'Регистрация временно отключена.'],
      [/email_provider_disabled|email provider is disabled/, 'Вход по email временно отключён.'],
      [/email_address_invalid|invalid email|unable to validate email/, 'Укажите корректный email.'],
      [/email_address_not_authorized|not authorized to send/, 'На этот email пока нельзя отправить письмо. Обратитесь к администратору сайта.'],
      [/over_email_send_rate_limit|email rate limit|too many.*email/, 'Слишком много писем отправлено за короткое время. Подождите и попробуйте снова.'],
      [/over_request_rate_limit|rate limit|too many requests|429/, 'Слишком много попыток. Подождите немного и попробуйте снова.'],
      [/otp_expired|token has expired|expired.*token|confirmation.*expired/, 'Ссылка подтверждения устарела. Запросите новое письмо.'],
      [/otp_disabled/, 'Подтверждение по коду временно отключено.'],
      [/captcha_failed|captcha/, 'Проверка безопасности не пройдена. Обновите страницу и попробуйте снова.'],
      [/session_not_found|refresh_token_not_found|refresh token.*not found|invalid refresh token|refresh_token_already_used|jwt expired/, 'Сессия истекла. Войдите в аккаунт повторно.'],
      [/user_not_found/, 'Пользователь с таким email не найден.'],
      [/validation_failed|bad_json|422/, 'Проверьте введённые данные и попробуйте снова.'],
      [/unexpected_failure|hook_timeout|hook_timeout_after_retry|5\d\d/, 'Сервис авторизации временно недоступен. Попробуйте позже.']
    ];
    const translated = translations.find(([pattern]) => pattern.test(normalized));
    if (translated) return translated[1];

    // Уже локализованные ошибки приложения можно показывать без изменений.
    if (message && /[А-Яа-яЁё]/.test(message) && !/[A-Za-z]{4,}/.test(message)) return message;
    if (Number(error.status) === 401 || Number(error.status) === 403) return 'Доступ запрещён. Войдите в аккаунт повторно.';
    if (Number(error.status) >= 500) return 'Сервис авторизации временно недоступен. Попробуйте позже.';
    return 'Не удалось выполнить авторизацию. Проверьте данные и попробуйте ещё раз.';
  }

  function setMessage(text, type) {
    message.textContent = text;
    message.className = `auth-message${type ? ` ${type}` : ''}`;
  }

  function getAuthParams() {
    const params = new URLSearchParams(window.location.search);
    if (window.location.hash.length > 1) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      hashParams.forEach((value, key) => params.set(key, value));
    }
    return params;
  }

  function isSignupConfirmationReturn() {
    const params = getAuthParams();
    return params.get('type') === 'signup' || params.has('token_hash');
  }

  function showSignupConfirmedMessage() {
    setMode('signin');
    openModal();
    setMessage(signupConfirmationMessage, 'success');
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState(null, '', cleanUrl);
  }

  function normalizeRussianPhone(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.length === 10 && digits[0] === '9') digits = `7${digits}`;
    if (digits.length === 11 && digits[0] === '8') digits = `7${digits.slice(1)}`;
    if (digits.length !== 11 || digits[0] !== '7') return '';
    return `+${digits}`;
  }

  function getPhoneDigits(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
    if (digits.startsWith('7')) digits = digits.slice(1);
    return digits.slice(0, 10);
  }

  function formatPhoneInput(value) {
    const digits = getPhoneDigits(value);
    if (!digits) return '+7 ';

    let formatted = '+7';
    if (digits.length > 0) formatted += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 3) formatted += ')';
    if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
    if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
    if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
    return formatted;
  }

  function movePhoneCaretToEnd(input) {
    requestAnimationFrame(() => {
      const end = input.value.length;
      input.setSelectionRange?.(end, end);
    });
  }

  function handlePhoneKeydown(event) {
    const input = event.currentTarget;
    const prefixLength = 3;
    const selectionStart = input.selectionStart ?? input.value.length;
    const selectionEnd = input.selectionEnd ?? input.value.length;
    const hasSelection = selectionStart !== selectionEnd;

    if ((event.key === 'Backspace' && selectionStart <= prefixLength && !hasSelection) ||
        (event.key === 'Delete' && selectionStart < prefixLength && !hasSelection)) {
      event.preventDefault();
      movePhoneCaretToEnd(input);
    }
  }

  function handlePhoneInput(event) {
    const input = event.currentTarget;
    input.value = formatPhoneInput(input.value);
    movePhoneCaretToEnd(input);
  }

  function validateSignupPhone() {
    const input = form.elements.phone;
    input.value = formatPhoneInput(input.value);
    const phone = normalizeRussianPhone(input.value);
    input.setAttribute('aria-invalid', String(!phone));
    return phone;
  }

  function setMode(nextMode) {
    mode = nextMode;
    setMessage('');
    resendButton.hidden = true;
    passwordInput.required = true;
    passwordInput.parentElement.hidden = false;
    const isSignup = nextMode === 'signup';
    resetButton.hidden = isSignup;
    signupFields.hidden = !isSignup;
    confirmField.hidden = !isSignup;
    consentField.hidden = !isSignup;
    form.elements.fullName.required = isSignup;
    form.elements.phone.required = isSignup;
    form.elements.passwordConfirm.required = isSignup;
    form.elements.consent.required = isSignup;
    passwordInput.autocomplete = isSignup ? 'new-password' : 'current-password';
    if (nextMode === 'signup') {
      form.elements.phone.value = formatPhoneInput(form.elements.phone.value);
      title.textContent = 'Создание аккаунта';
      subtitle.textContent = 'Зарегистрируйтесь с помощью email и пароля';
      submit.textContent = 'Зарегистрироваться';
      switchText.firstChild.textContent = 'Уже есть аккаунт? ';
      modeButton.textContent = 'Войти';
    } else {
      title.textContent = 'Вход в аккаунт';
      subtitle.textContent = 'Войдите, чтобы пользоваться личным аккаунтом';
      submit.textContent = 'Войти';
      switchText.firstChild.textContent = 'Нет аккаунта? ';
      modeButton.textContent = 'Зарегистрироваться';
    }
  }

  function openModal() {
    modal.hidden = false;
    document.body.classList.add('auth-open');
    if (initializationError) setMessage(initializationError, 'error');
    setTimeout(() => form.elements.email.focus(), 0);
  }

  // Публичный обработчик используется прямо кнопкой в HTML. Он не зависит от
  // других обработчиков клика и остаётся доступным для повторного открытия.
  window.openImmerscapeAuth = () => {
    if (currentUser) window.location.href = 'profile.html';
    else openModal();
  };
  if (isSignupConfirmationReturn()) showSignupConfirmedMessage();
  else if (window.location.hash === '#auth') openModal();

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('auth-open');
    form.reset();
    form.elements.phone.value = '+7 ';
    setMode('signin');
  }

  function renderUser(user) {
    currentUser = user;
    if (user) {
      button.textContent = user.user_metadata?.full_name || user.email || 'Профиль';
      button.classList.add('signed-in');
      button.title = 'Открыть профиль';
    } else {
      button.textContent = 'Профиль';
      button.classList.remove('signed-in');
      button.title = 'Войти или зарегистрироваться';
    }
  }

  button.addEventListener('click', async event => {
    event.preventDefault();
    if (!currentUser) return openModal();
    window.location.href = 'profile.html';
  });
  modal.querySelectorAll('[data-auth-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });
  modeButton.addEventListener('click', () => setMode(mode === 'signin' ? 'signup' : 'signin'));
  form.elements.phone.addEventListener('focus', function() {
    if (!this.value.trim()) this.value = '+7 ';
    movePhoneCaretToEnd(this);
  });
  form.elements.phone.addEventListener('keydown', handlePhoneKeydown);
  form.elements.phone.addEventListener('input', handlePhoneInput);
  form.elements.phone.addEventListener('blur', function() {
    this.value = formatPhoneInput(this.value);
  });

  resetButton.addEventListener('click', async () => {
    if (!client) return setMessage(initializationError || 'Авторизация недоступна.', 'error');
    const email = form.elements.email.value.trim();
    if (!email) {
      setMessage('Сначала укажите email.', 'error');
      return form.elements.email.focus();
    }
    resetButton.disabled = true;
    try {
      const { error } = await withTimeout(client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}`
      }));
      setMessage(error ? getErrorMessage(error) : 'Ссылка для восстановления отправлена на email.', error ? 'error' : 'success');
    } catch (error) {
      setMessage(getErrorMessage(error), 'error');
    } finally {
      resetButton.disabled = false;
    }
  });

  resendButton.addEventListener('click', async () => {
    if (!client) return setMessage(initializationError || 'Авторизация недоступна.', 'error');
    const email = form.elements.email.value.trim();
    if (!email) return setMessage('Укажите email для повторной отправки.', 'error');
    resendButton.disabled = true;
    try {
      const { error } = await withTimeout(client.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: window.location.origin }
      }));
      setMessage(error ? getErrorMessage(error) : 'Новое письмо подтверждения отправлено. Проверьте также папку «Спам».', error ? 'error' : 'success');
    } catch (error) {
      setMessage(getErrorMessage(error), 'error');
    } finally {
      resendButton.disabled = false;
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!client) return setMessage(initializationError || 'Авторизация недоступна.', 'error');
    setMessage('');
    submit.disabled = true;
    submit.textContent = 'Подождите…';
    const email = form.elements.email.value.trim();
    const password = passwordInput.value;
    if (mode === 'signup' && password !== form.elements.passwordConfirm.value) {
      submit.disabled = false;
      submit.textContent = 'Зарегистрироваться';
      return setMessage('Пароли не совпадают.', 'error');
    }
    const signupPhone = mode === 'signup' ? validateSignupPhone() : '';
    if (mode === 'signup' && !signupPhone) {
      submit.disabled = false;
      submit.textContent = 'Зарегистрироваться';
      form.elements.phone.focus();
      return setMessage('Введите корректный номер телефона: +7 и 10 цифр.', 'error');
    }
    const metadata = {
      full_name: form.elements.fullName.value.trim(),
      phone: mode === 'signup' ? signupPhone : form.elements.phone.value.trim()
    };
    try {
      const request = mode === 'signup'
        ? client.auth.signUp({ email, password, options: { data: metadata, emailRedirectTo: window.location.origin } })
        : client.auth.signInWithPassword({ email, password });
      const result = await withTimeout(request);
      if (result.error) {
        setMessage(getErrorMessage(result.error), 'error');
        return;
      }
      if (mode === 'signup' && !result.data.session) {
        setMessage('Код подтверждения отправлен на почту.', 'success');
        resendButton.hidden = false;
        return;
      }
      closeModal();
    } catch (error) {
      setMessage(getErrorMessage(error), 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = mode === 'signup' ? 'Зарегистрироваться' : 'Войти';
    }
  });

  if (client) {
    client.auth.getSession().then(({ data }) => renderUser(data.session?.user || null));
    client.auth.onAuthStateChange((event, session) => {
      renderUser(session?.user || null);
      if (event === 'SIGNED_IN' && isSignupConfirmationReturn()) showSignupConfirmedMessage();
    });
  }
})();
