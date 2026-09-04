const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const bookingSource = fs.readFileSync('js/booking.js', 'utf8');
const authSource = fs.readFileSync('js/auth.js', 'utf8');
const schemaSource = fs.readFileSync('supabase/schema.sql', 'utf8');
const staffSource = fs.readFileSync('js/staff.js', 'utf8');
const { getUpstreamPath } = require('../server/my-erp');
const {
  formatBookingMessage,
  cleanEnvironmentValue,
  getChatIdForLocation,
  sendTelegramBooking
} = require('../server/telegram-booking');

function loadAuthErrorTranslator() {
  const start = authSource.indexOf('function getErrorMessage(error)');
  const end = authSource.indexOf('function setMessage(', start);
  return vm.runInNewContext(`(${authSource.slice(start, end).trim()})`);
}

test('confirmation does not send a booking to my-ERP', () => {
  const confirmation = bookingSource.slice(
    bookingSource.indexOf('async function confirmBooking()'),
    bookingSource.indexOf('// ===== ИНИЦИАЛИЗАЦИЯ =====')
  );
  assert.doesNotMatch(confirmation, /api\.book\s*\(/);
  assert.match(confirmation, /staff\.rpc\('create_site_booking'/);
});

test('extra services stay separate from the order comment and omit descriptions', () => {
  const confirmation = bookingSource.slice(
    bookingSource.indexOf('async function confirmBooking()'),
    bookingSource.indexOf('// ===== ИНИЦИАЛИЗАЦИЯ =====')
  );
  assert.match(confirmation, /servicesText = selectedServices\.map\(service => `\$\{service\.name\} — \$\{service\.price\} ₽`\)/);
  assert.doesNotMatch(confirmation, /Дополнительные услуги: \$\{servicesText\}/);
  assert.doesNotMatch(confirmation, /service\.description/);
  assert.doesNotMatch(confirmation, /Описание: \$\{currentBookingDesc\}/);
  assert.match(confirmation, /const integrationComment = clientComment;/);
  assert.match(staffSource, /replace\(\/\\s\+\\\(\[\^\)\]\*\\\)\\s\*\$\/, ''\)/);
});

test('operator updates are restricted to status and paid amount', () => {
  assert.match(schemaSource, /function public\.operator_update_booking/);
  assert.match(schemaSource, /set status = p_status, paid_amount = p_paid_amount/);
  assert.match(staffSource, /role === 'operator'.*operator_update_booking/);
});

test('ERP fallback slots, including Dentistry, always have editable booking data', () => {
  assert.match(staffSource, /booking: \{\}/);
  assert.match(staffSource, /const booking = \(isErp \? item\.booking : item\) \|\| \{\}/);
  assert.match(staffSource, /const key = `erp-\$\{questIndex\}-\$\{slotIndex\}`/);
});

test('hosting-neutral proxy maps only supported my-ERP endpoints', () => {
  assert.equal(
    getUpstreamPath('/api/my-erp/timetable/4893.json'),
    '/booking_api/timetable/4893.json'
  );
  assert.equal(
    getUpstreamPath('/api/my-erp/get_tariff_with_players/4893', '?date=2026-08-09'),
    '/booking_api/get_tariff_with_players/4893?date=2026-08-09'
  );
  assert.equal(getUpstreamPath('/api/my-erp/../../admin'), null);
});

test('database function atomically creates a new booking and client', () => {
  assert.match(schemaSource, /create or replace function public\.create_site_booking/);
  assert.match(schemaSource, /'new'/);
  assert.match(schemaSource, /insert into public\.staff_bookings/);
  assert.match(schemaSource, /insert into public\.staff_clients/);
  assert.match(schemaSource, /idempotency_key/);
  assert.match(schemaSource, /v_booking_id bigint/);
  assert.doesNotMatch(schemaSource, /declare\s+booking_id bigint/);
  assert.match(schemaSource, /on conflict on constraint staff_clients_booking_id_key/);
  assert.match(schemaSource, /set comment = booking\.comment/);
});

test('supported location bookings notify Telegram only after database success', () => {
  const confirmation = bookingSource.slice(
    bookingSource.indexOf('async function confirmBooking()'),
    bookingSource.indexOf('// ===== ИНИЦИАЛИЗАЦИЯ =====')
  );
  assert.match(bookingSource, /fetch\('\/api\/telegram-booking'/);
  assert.match(bookingSource, /Выберите квест внутри пакета/);
  assert.doesNotMatch(bookingSource, /notificationLocations\.has\(booking\.location\)/);
  assert.ok(confirmation.indexOf('await notifyTelegramAboutBooking') > confirmation.indexOf("staff.rpc('create_site_booking'"));
});

test('Telegram message contains complete booking details and escapes HTML', () => {
  const message = formatBookingMessage({
    bookingId: 42,
    bookingName: '<Квест>',
    packageQuest: 'Рик и Морти',
    location: 'м. Профсоюзная',
    address: 'ул. Кржижановского, 8',
    date: '2026-08-20',
    time: '18:00',
    players: 4,
    horrorVariant: 'VIP хоррор вечер — 15000 ₽',
    clientName: 'Иван',
    clientPhone: '+79990000000',
    clientEmail: 'ivan@example.com',
    contactMethod: 'Telegram',
    extraServices: 'Актёр — 1000 ₽',
    comment: 'Позвонить',
    promoCode: 'квест10',
    basePrice: '6000 ₽',
    discount: '-500 ₽',
    deposit: '1500 ₽',
    total: '6500 ₽'
  });
  assert.match(message, /^<b>💥НОВАЯ БРОНЬ🛐<\/b>/);
  assert.match(message, /<b>Дата: 2026-08-20<\/b>/);
  assert.match(message, /<b>Формат вечера: VIP хоррор вечер — 15000 ₽<\/b>/);
  assert.match(message, /<b>Предоплата: 1500 ₽<\/b>/);
  assert.match(message, /<b>Сколько взять: <tg-spoiler>6500 ₽<\/tg-spoiler><\/b>/);
  assert.doesNotMatch(message, /ID брони|Локация|Адрес|Сумма до скидки|Доплата за игроков/);
  assert.match(message, /&lt;Квест&gt;/);
  assert.doesNotMatch(message, /<Квест>/);
});

test('Telegram environment values tolerate whitespace and accidental quotes', () => {
  assert.equal(cleanEnvironmentValue('  123:token  '), '123:token');
  assert.equal(cleanEnvironmentValue('"123:token"'), '123:token');
  assert.equal(cleanEnvironmentValue(" '-100123' "), '-100123');
});

test('Telegram chat is selected by booking location', () => {
  const environment = {
    TELEGRAM_CHAT_ID: '-1001',
    TELEGRAM_CHAT_ID_IZMAYLOVSKAYA: '-1002',
    TELEGRAM_CHAT_ID_TAGANSKAYA: '-1003'
  };
  assert.equal(getChatIdForLocation('м. Профсоюзная', environment), '-1001');
  assert.equal(getChatIdForLocation('м. Измайловская', environment), '-1002');
  assert.equal(getChatIdForLocation('м. Таганская', environment), '-1003');
  assert.equal(getChatIdForLocation('м. Неизвестная', environment), '');
});

test('Telegram endpoint reports missing hosting configuration in Russian', async () => {
  const result = await sendTelegramBooking({
    bookingId: 42,
    bookingName: 'Пакет на 2 часа',
    location: 'м. Профсоюзная',
    date: '2026-09-10',
    time: '12:00',
    clientName: 'Иван',
    clientPhone: '+79990000000'
  }, {});
  assert.equal(result.statusCode, 503);
  assert.equal(result.body.error, 'Telegram-уведомления не настроены.');
});

test('common Supabase authentication errors are translated into Russian', () => {
  const translate = loadAuthErrorTranslator();
  assert.equal(translate({ code: 'invalid_credentials', message: 'Invalid login credentials' }), 'Неверный email или пароль.');
  assert.match(translate({ code: 'email_not_confirmed', message: 'Email not confirmed' }), /Email ещё не подтверждён/);
  assert.match(translate({ code: 'over_request_rate_limit', message: 'Too many requests' }), /Слишком много попыток/);
  assert.equal(translate({ message: 'Some unknown provider failure' }), 'Не удалось выполнить авторизацию. Проверьте данные и попробуйте ещё раз.');
});
