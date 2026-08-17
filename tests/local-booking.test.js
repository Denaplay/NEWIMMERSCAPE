const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const bookingSource = fs.readFileSync('js/booking.js', 'utf8');
const schemaSource = fs.readFileSync('supabase/schema.sql', 'utf8');
const staffSource = fs.readFileSync('js/staff.js', 'utf8');
const { getUpstreamPath } = require('../netlify/functions/my-erp');
const { formatBookingMessage } = require('../netlify/functions/telegram-booking');

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

test('Netlify proxy maps only supported my-ERP endpoints', () => {
  assert.equal(
    getUpstreamPath({ rawPath: '/.netlify/functions/my-erp/timetable/4893.json', rawQuery: '' }),
    '/booking_api/timetable/4893.json'
  );
  assert.equal(
    getUpstreamPath({ path: '/api/my-erp/get_tariff_with_players/4893', rawQuery: 'date=2026-08-09' }),
    '/booking_api/get_tariff_with_players/4893?date=2026-08-09'
  );
  assert.equal(getUpstreamPath({ path: '/api/my-erp/../../admin' }), null);
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

test('Profsoyuznaya bookings notify Telegram only after database success', () => {
  const confirmation = bookingSource.slice(
    bookingSource.indexOf('async function confirmBooking()'),
    bookingSource.indexOf('// ===== ИНИЦИАЛИЗАЦИЯ =====')
  );
  assert.match(bookingSource, /booking\.location !== 'м\. Профсоюзная'/);
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
    clientName: 'Иван',
    clientPhone: '+79990000000',
    clientEmail: 'ivan@example.com',
    contactMethod: 'Telegram',
    extraServices: 'Актёр — 1000 ₽',
    comment: 'Позвонить',
    promoCode: 'квест10',
    basePrice: '6000 ₽',
    extraPlayerCost: '500 ₽',
    subtotal: '7000 ₽',
    discount: '-500 ₽',
    deposit: '1500 ₽',
    total: '6500 ₽'
  });
  assert.match(message, /ID брони:<\/b> 42/);
  assert.match(message, /Предоплата:<\/b> 1500 ₽/);
  assert.match(message, /Итого:<\/b> 6500 ₽/);
  assert.match(message, /&lt;Квест&gt;/);
  assert.doesNotMatch(message, /<Квест>/);
});
