const TELEGRAM_API_ORIGIN = 'https://api.telegram.org';

const CHAT_ENV_BY_LOCATION = Object.freeze({
  'м. Профсоюзная': 'TELEGRAM_CHAT_ID_PROFSOYUZNAYA',
  'м. Измайловская': 'TELEGRAM_CHAT_ID_IZMAYLOVSKAYA',
  'м. Таганская': 'TELEGRAM_CHAT_ID_TAGANSKAYA'
});

function clean(value, maxLength = 500) {
  return String(value == null ? '' : value).trim().slice(0, maxLength);
}

function cleanEnvironmentValue(value) {
  const trimmed = String(value == null ? '' : value).trim();
  const quote = trimmed[0];
  if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getChatIdForLocation(location, environment = process.env) {
  const environmentKey = CHAT_ENV_BY_LOCATION[clean(location, 100)];
  if (!environmentKey) return '';

  const fallback = environmentKey === 'TELEGRAM_CHAT_ID_PROFSOYUZNAYA'
    ? environment.TELEGRAM_CHAT_ID
    : '';
  return cleanEnvironmentValue(environment[environmentKey] || fallback);
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function addLine(lines, label, value, fallback = '—') {
  lines.push(`<b>${label}: ${escapeHtml(value) || fallback}</b>`);
}

function addSpoilerLine(lines, label, value, fallback = '—') {
  lines.push(`<b>${label}: <tg-spoiler>${escapeHtml(value) || fallback}</tg-spoiler></b>`);
}

function formatBookingMessage(booking) {
  const lines = ['<b>💥НОВАЯ БРОНЬ🛐</b>', ''];

  addLine(lines, 'Квест / пакет', booking.bookingName);
  if (booking.packageQuest) addLine(lines, 'Квест в пакете', booking.packageQuest);
  addLine(lines, 'Дата', booking.date);
  addLine(lines, 'Время', booking.time);
  addLine(lines, 'Игроков', booking.players);
  if (booking.horrorVariant) addLine(lines, 'Формат вечера', booking.horrorVariant);
  lines.push('');
  addLine(lines, 'Имя', booking.clientName);
  addLine(lines, 'Телефон', booking.clientPhone);
  addLine(lines, 'Email', booking.clientEmail);
  addLine(lines, 'Способ связи', booking.contactMethod);
  if (booking.contactHandle) addLine(lines, 'Контакт', booking.contactHandle);
  lines.push('');
  addLine(lines, 'Доп. услуги', booking.extraServices);
  addLine(lines, 'Комментарий', booking.comment);
  addLine(lines, 'Промокод', booking.promoCode);
  addLine(lines, 'Базовая цена', booking.basePrice);
  addLine(lines, 'Скидка', booking.discount);
  addLine(lines, 'Предоплата', booking.deposit);
  addSpoilerLine(lines, 'Сколько взять', booking.total);

  return lines.join('\n');
}

async function sendTelegramBooking(booking, environment = process.env) {
  const location = clean(booking?.location, 100);
  if (!booking || !CHAT_ENV_BY_LOCATION[location]) {
    return { statusCode: 400, body: { error: 'Не удалось определить локацию бронирования.' } };
  }

  const requiredFields = ['bookingId', 'bookingName', 'date', 'time', 'clientName', 'clientPhone'];
  if (requiredFields.some(field => !clean(booking[field]))) {
    return { statusCode: 400, body: { error: 'В бронировании не заполнены обязательные поля.' } };
  }

  const botToken = cleanEnvironmentValue(environment.TELEGRAM_BOT_TOKEN);
  const chatId = getChatIdForLocation(location, environment);
  if (!botToken || !chatId) {
    console.error('Telegram-уведомления не настроены', {
      location,
      chatEnvironmentKey: CHAT_ENV_BY_LOCATION[location]
    });
    return { statusCode: 503, body: { error: 'Telegram-уведомления не настроены.' } };
  }

  if (!/^\d+:[A-Za-z0-9_-]+$/.test(botToken)) {
    console.error('Неверный формат токена Telegram-бота', {
      botId: botToken.split(':')[0] || 'не указан',
      tokenLength: botToken.length
    });
    return { statusCode: 503, body: { error: 'Неверный формат токена Telegram-бота.' } };
  }

  try {
    const response = await fetch(`${TELEGRAM_API_ORIGIN}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatBookingMessage(booking),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(10000)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) {
      throw new Error(result.description || `Telegram HTTP ${response.status}`);
    }
    return { statusCode: 200, body: { sent: true } };
  } catch (error) {
    console.error('Не удалось отправить Telegram-уведомление:', error?.message || error, {
      botId: botToken.split(':')[0],
      tokenLength: botToken.length,
      chatId
    });
    return { statusCode: 502, body: { error: 'Не удалось отправить Telegram-уведомление.' } };
  }
}

module.exports = {
  CHAT_ENV_BY_LOCATION,
  cleanEnvironmentValue,
  formatBookingMessage,
  getChatIdForLocation,
  sendTelegramBooking
};
