const TELEGRAM_API_ORIGIN = 'https://api.telegram.org';
const PROFSOYUZNAYA_LOCATION = 'м. Профсоюзная';

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function clean(value, maxLength = 500) {
  return String(value == null ? '' : value).trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function addLine(lines, label, value, fallback = '—') {
  lines.push(`<b>${label}:</b> ${escapeHtml(value) || fallback}`);
}

function formatBookingMessage(booking) {
  const lines = ['<b>🟣 Новая бронь · Профсоюзная</b>', ''];

  addLine(lines, 'ID брони', booking.bookingId);
  addLine(lines, 'Квест / пакет', booking.bookingName);
  if (booking.packageQuest) addLine(lines, 'Квест в пакете', booking.packageQuest);
  addLine(lines, 'Локация', booking.location);
  addLine(lines, 'Адрес', booking.address);
  addLine(lines, 'Дата', booking.date);
  addLine(lines, 'Время', booking.time);
  addLine(lines, 'Игроков', booking.players);
  lines.push('');
  addLine(lines, 'Имя', booking.clientName);
  addLine(lines, 'Телефон', booking.clientPhone);
  addLine(lines, 'Email', booking.clientEmail);
  addLine(lines, 'Способ связи', booking.contactMethod);
  lines.push('');
  addLine(lines, 'Доп. услуги', booking.extraServices);
  addLine(lines, 'Комментарий', booking.comment);
  addLine(lines, 'Промокод', booking.promoCode);
  addLine(lines, 'Базовая цена', booking.basePrice);
  addLine(lines, 'Доплата за игроков', booking.extraPlayerCost);
  addLine(lines, 'Сумма до скидки', booking.subtotal);
  addLine(lines, 'Скидка', booking.discount);
  addLine(lines, 'Предоплата', booking.deposit);
  addLine(lines, 'Итого', booking.total);

  return lines.join('\n');
}

function parseBody(event) {
  if (!event.body) return null;
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  return JSON.parse(rawBody);
}

exports.handler = async function handler(event) {
  if (String(event.httpMethod || '').toUpperCase() !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let booking;
  try {
    booking = parseBody(event);
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  if (!booking || clean(booking.location, 100) !== PROFSOYUZNAYA_LOCATION) {
    return jsonResponse(200, { skipped: true });
  }

  const requiredFields = ['bookingId', 'bookingName', 'date', 'time', 'clientName', 'clientPhone'];
  if (requiredFields.some(field => !clean(booking[field]))) {
    return jsonResponse(400, { error: 'Missing required booking fields' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.error('Telegram booking notification is not configured');
    return jsonResponse(503, { error: 'Telegram is not configured' });
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
    return jsonResponse(200, { sent: true });
  } catch (error) {
    console.error('Telegram booking notification failed:', error?.message || error);
    return jsonResponse(502, { error: 'Telegram notification failed' });
  }
};

exports.formatBookingMessage = formatBookingMessage;
