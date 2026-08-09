const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const bookingSource = fs.readFileSync('js/booking.js', 'utf8');
const schemaSource = fs.readFileSync('supabase/schema.sql', 'utf8');
const staffSource = fs.readFileSync('js/staff.js', 'utf8');

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
