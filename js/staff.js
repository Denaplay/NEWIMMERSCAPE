(async function initStaffPage() {
  'use strict';
  const config = window.IMMERSCAPE_SUPABASE_CONFIG;
  const client = window.ImmerscapeSupabaseAuth?.createClient(config?.url, config?.publishableKey);
  const status = document.getElementById('staffStatus');
  if (!client || !status) return;
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (!session?.user) return deny(sessionError?.message || 'Необходимо войти в аккаунт.');
  const { data: me, error: profileError } = await client.profiles.get(session.user.id);
  if (profileError) return deny(`Не удалось проверить разрешения: ${profileError.message}`);
  const role = me?.permission || '';
  document.getElementById('staffRole').textContent = role || 'нет доступа';
  if (!role) return deny('Этот раздел доступен только сотрудникам.');

  function deny(text) { status.textContent = text; setTimeout(() => { location.href = 'profile.html'; }, 1200); }
  function esc(value) { const el = document.createElement('span'); el.textContent = String(value ?? ''); return el.innerHTML; }
  async function remove(table, id) {
    if (!confirm('Удалить запись без возможности восстановления?')) return;
    const { error } = await client.staff.remove(table, id);
    if (error) return alert(error.message);
    location.reload();
  }

  const clients = document.getElementById('staffClients');
  if (clients) {
    if (!['manager', 'organizator'].includes(role)) return deny('У вас нет доступа к списку клиентов.');
    const { data, error } = await client.staff.list('staff_clients', 'select=*&order=created_at.desc');
    if (error) return deny(error.message);
    status.hidden = true;
    const clientById = new Map(data.map(item => [String(item.id), item]));
    const extrasList = value => {
      const entries = String(value || '').split(';').map(entry => entry.trim().replace(/\s+\([^)]*\)\s*$/, '')).filter(Boolean);
      return entries.length ? `<ul class="client-extras">${entries.map(entry => `<li>${esc(entry)}</li>`).join('')}</ul>` : '<span class="muted">Нет</span>';
    };
    clients.innerHTML = data.map(item => `<tr data-id="${item.id}"><td><strong>${esc(item.client_name)}</strong><small>${esc(item.client_phone)}<br>${esc(item.client_email)}</small></td><td>${esc(item.quest_name)}</td><td>${esc(item.booking_date)}<br>${String(item.booking_time).slice(0,5)}</td><td><p class="client-comment">${esc(item.comment || 'Без комментария')}</p>${extrasList(item.extra_services)}</td><td><button data-client-edit>${role === 'organizator' ? 'Редактировать' : 'Подробнее'}</button>${role === 'organizator' ? '<button data-delete>Удалить</button>' : ''}</td></tr>`).join('');
    const clientModal = document.getElementById('clientEditModal');
    const clientContent = document.getElementById('clientEditContent');
    const closeClient = () => { clientModal.hidden = true; };
    clientModal.querySelectorAll('[data-client-close]').forEach(element => element.addEventListener('click', closeClient));
    clients.addEventListener('click', async event => {
      const row = event.target.closest('tr'); if (!row) return;
      if (event.target.matches('[data-delete]')) return remove('staff_clients', row.dataset.id);
      if (!event.target.matches('[data-client-edit]')) return;
      const item = clientById.get(row.dataset.id);
      const editable = role === 'organizator';
      clientContent.innerHTML = `<h2>${editable ? 'Редактировать клиента' : 'Информация о клиенте'}</h2><div class="booking-edit-grid"><label>Имя и фамилия<input name="client_name" value="${esc(item.client_name)}" ${editable ? '' : 'readonly'}></label><label>Телефон<input value="${esc(item.client_phone)}" readonly></label><label class="wide">Комментарий<textarea name="comment" ${editable ? '' : 'readonly'}>${esc(item.comment || '')}</textarea></label><label class="wide">Дополнительные услуги<textarea name="extra_services" ${editable ? '' : 'readonly'}>${esc(item.extra_services || '')}</textarea></label></div>${editable ? '<div class="booking-info-actions"><button data-client-save>Сохранить</button></div>' : ''}`;
      clientModal.hidden = false;
      clientContent.querySelector('[data-client-save]')?.addEventListener('click', async () => {
        const values = { client_name: clientContent.querySelector('[name="client_name"]').value.trim(), comment: clientContent.querySelector('[name="comment"]').value.trim(), extra_services: clientContent.querySelector('[name="extra_services"]').value.trim() };
        const { error: saveError } = await client.staff.update('staff_clients', item.id, values);
        if (saveError) return alert(saveError.message);
        location.reload();
      });
    });
  }

  const calendar = document.getElementById('staffCalendar');
  if (calendar) {
    const month = document.getElementById('staffMonth');
    const grid = document.getElementById('staffBookingGrid');
    const infoModal = document.getElementById('bookingInfoModal');
    const infoContent = document.getElementById('bookingInfoContent');
    const bookingById = new Map();
    const erpSlotByKey = new Map();
    const statusNames = { new: 'Новое', service: 'Служебный', confirmed: 'Подтверждён', visited: 'Был', no_answer: 'Недозвон', awaiting_prepayment: 'Ожидает предоплаты', closed: 'Закрытый', available: 'Свободно' };
    const statusAliases = { 'новый': 'new', 'новое': 'new', booked: 'confirmed', busy: 'confirmed', paid: 'confirmed', completed: 'visited', done: 'visited', noanswer: 'no_answer', waiting_payment: 'awaiting_prepayment', blocked: 'closed', disabled: 'closed', unavailable: 'closed', 'подтвержден': 'confirmed', 'подтверждён': 'confirmed', 'был': 'visited', 'недозвон': 'no_answer', 'ожидает предоплаты': 'awaiting_prepayment', 'служебный': 'service', 'закрытый': 'closed', 'закрыт': 'closed' };
    const normalizeStatus = value => { const key = String(value || '').toLowerCase(); return statusNames[key] ? key : (statusAliases[key] || 'closed'); };
    let employees = [];
    if (role !== 'operator') { const result = await client.staff.list('profiles', 'select=full_name,permission&permission=not.is.null&order=full_name'); employees = result.data || []; }
    month.value = new Date().toISOString().slice(0, 7);

    function renderMonth() {
      const [year, monthNumber] = month.value.split('-').map(Number);
      const days = new Date(year, monthNumber, 0).getDate();
      calendar.innerHTML = Array.from({ length: days }, (_, i) => `<button data-date="${month.value}-${String(i + 1).padStart(2, '0')}">${i + 1}</button>`).join('');
    }

    function closeInfo() { infoModal.hidden = true; }
    infoModal.querySelectorAll('[data-info-close]').forEach(element => element.addEventListener('click', closeInfo));

    function employeeOptions(selected) {
      const names = [...new Set([selected, ...employees.map(employee => employee.full_name)].filter(Boolean))];
      return '<option value="">Не назначен</option>' + names.map(name => `<option value="${esc(name)}" ${name === selected ? 'selected' : ''}>${esc(name)}</option>`).join('');
    }

    function bookingEditor(item, isErp) {
      const booking = (isErp ? item.booking : item) || {};
      const fullEdit = role !== 'operator';
      return `<h2>${esc(item.quest_name || item.quest)}</h2><div class="booking-edit-grid"><label>Дата<input name="booking_date" type="date" value="${esc(item.booking_date || item.date)}" ${fullEdit ? '' : 'readonly'}></label><label>Время<input name="booking_time" type="time" value="${String(item.booking_time || item.time).slice(0,5)}" ${fullEdit ? '' : 'readonly'}></label><label>Имя и фамилия<input name="client_name" value="${esc(booking.client_name || booking.clientName || '')}" ${fullEdit ? '' : 'readonly'}></label><label>Телефон<input name="client_phone" value="${esc(booking.client_phone || booking.phone || '')}" ${fullEdit ? '' : 'readonly'}></label><label>Email<input name="client_email" value="${esc(booking.client_email || booking.email || '')}" ${fullEdit ? '' : 'readonly'}></label><label>Назначенный сотрудник<select name="assigned_employee" ${fullEdit ? '' : 'disabled'}>${employeeOptions(booking.assigned_employee || booking.assignedEmployee || '')}</select></label><label>Оплачено<input name="paid_amount" type="number" min="0" step="0.01" value="${Number(booking.paid_amount ?? booking.paidAmount ?? 0)}"></label><label>Предоплата<input name="prepayment_amount" type="number" min="0" step="0.01" value="${Number(booking.prepayment_amount ?? booking.prepaymentAmount ?? 0)}" ${fullEdit ? '' : 'readonly'}></label><label class="wide">Комментарий клиента<textarea name="comment" ${fullEdit ? '' : 'readonly'}>${esc(booking.comment || booking.clientComment || '')}</textarea></label><label class="wide">Служебный комментарий<textarea name="service_comment" ${fullEdit ? '' : 'readonly'}>${esc(booking.service_comment || booking.serviceComment || '')}</textarea></label><label class="wide">Статус<select name="status">${Object.entries(statusNames).filter(([key]) => key !== 'available').map(([key,name]) => `<option value="${key}" ${normalizeStatus(item.status || item.bookingStatus) === key ? 'selected' : ''}>${name}</option>`).join('')}</select></label></div><div class="booking-info-lines"><p><b>Игроков:</b> ${booking.players || '—'}</p><p><b>Доп. услуги:</b> ${esc(booking.extra_services || 'Нет')}</p><p><b>Сумма:</b> ${esc(booking.total_amount || '—')}</p><p><b>Источник:</b> ${isErp ? 'my-ERP' : esc(item.source || 'сайт')}</p></div><div class="booking-info-actions"><button data-info-save>${isErp ? 'Сохранить в сетке' : 'Сохранить'}</button>${fullEdit && !isErp ? '<button data-info-delete>Удалить бронь</button>' : ''}</div>`;
    }

    function formValues() {
      const field = name => infoContent.querySelector(`[name="${name}"]`).value;
      return { booking_date: field('booking_date'), booking_time: field('booking_time'), client_name: field('client_name').trim(), client_phone: field('client_phone').trim(), client_email: field('client_email').trim(), assigned_employee: field('assigned_employee'), paid_amount: Number(field('paid_amount')) || 0, prepayment_amount: Number(field('prepayment_amount')) || 0, comment: field('comment').trim(), service_comment: field('service_comment').trim(), status: field('status') };
    }

    function showDatabaseBooking(item) {
      infoContent.innerHTML = bookingEditor(item, false);
      infoModal.hidden = false;
      infoContent.querySelector('[data-info-save]')?.addEventListener('click', async () => { const values = formValues(); const result = role === 'operator' ? await client.staff.rpc('operator_update_booking', { p_booking_id: item.id, p_status: values.status, p_paid_amount: values.paid_amount }) : await client.staff.update('staff_bookings', item.id, values); if (result.error) return alert(result.error.message); Object.assign(item, role === 'operator' ? { status: values.status, paid_amount: values.paid_amount } : values); const button = document.querySelector(`[data-booking-id="${item.id}"]`); button?.setAttribute('data-status', values.status); if (button) button.querySelector('span').textContent = statusNames[values.status]; closeInfo(); });
      infoContent.querySelector('[data-info-delete]')?.addEventListener('click', () => remove('staff_bookings', item.id));
    }

    function showErpSlot(slot) {
      infoContent.innerHTML = bookingEditor(slot, true);
      infoModal.hidden = false;
      infoContent.querySelector('[data-info-save]')?.addEventListener('click', async () => {
        const values = formValues();
        const { data, error } = await client.staff.create('staff_bookings', { ...values, quest_name: slot.quest, user_id: null, players: 1, source: 'my-erp', erp_slot_id: String(slot.id || ''), extra_services: '', total_amount: slot.price ? `${slot.price} ₽` : '' });
        if (error) return alert(error.message);
        const saved = Array.isArray(data) ? data[0] : null;
        if (saved) {
          bookingById.set(String(saved.id), saved);
          const button = [...grid.querySelectorAll('[data-erp-key]')].find(element => element.dataset.erpKey === slot.gridKey);
          if (button) { button.removeAttribute('data-erp-key'); button.dataset.bookingId = saved.id; button.dataset.status = values.status; button.querySelector('span').textContent = statusNames[values.status]; }
        }
        alert('Изменения старого слота сохранены в служебной сетке.'); closeInfo();
      });
    }

    month.addEventListener('change', renderMonth); renderMonth(); status.hidden = true;
    calendar.addEventListener('click', async event => {
      const date = event.target.dataset.date; if (!date) return;
      document.getElementById('staffSelectedDate').textContent = new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      const { data, error } = await client.staff.list('staff_bookings', `select=*&booking_date=eq.${date}&order=booking_time`);
      if (error) return alert(error.message);
      bookingById.clear(); data.forEach(item => bookingById.set(String(item.id), item)); erpSlotByKey.clear();
      const quests = ['Стоматология "Новая жизнь"', 'Рик и Морти', 'K-pop: последний стрим', 'Запретная дверь', 'Изнанка в разуме Векны', 'Невеста', 'Хогвартс', 'Лабубу: волшебный мир', 'Монастырь', 'Гринч', 'Хоррор-свидание', 'Хоррор-вечер', 'Among Us'];
      const erp = window.QuestBookingApi;
      if (erp) await Promise.all(quests.filter(quest => erp.getConfig(quest)).map(quest => erp.load(quest)));
      grid.innerHTML = quests.map((quest, questIndex) => {
        const items = data.filter(item => item.quest_name === quest);
        const itemByTime = new Map(items.map(item => [String(item.booking_time).slice(0,5), item]));
        let slots = erp?.getSlots(quest, date) || [];
        if (!slots.length) slots = Array.from({ length: 13 }, (_, index) => ({ time: `${String(index + 10).padStart(2,'0')}:00`, available: true, price: 0, bookingStatus: 'available', booking: {} }));
        const allTimes = [...new Set([...slots.map(slot => slot.time), ...itemByTime.keys()])].sort();
        const slotButtons = allTimes.map((time, slotIndex) => {
          const item = itemByTime.get(time);
          if (item) return `<button class="staff-slot" data-booking-id="${item.id}" data-status="${normalizeStatus(item.status)}"><strong>${time}</strong><span>${statusNames[normalizeStatus(item.status)]}</span></button>`;
          const slot = slots.find(entry => entry.time === time) || { time, available: true, price: 0, booking: {} };
          const key = `erp-${questIndex}-${slotIndex}`; erpSlotByKey.set(key, { ...slot, booking: slot.booking || {}, quest, date, gridKey: key });
          const erpStatus = slot.available ? 'available' : normalizeStatus(slot.bookingStatus);
          return `<button class="staff-slot" data-erp-key="${esc(key)}" data-status="${erpStatus}"><strong>${time}</strong><span>${statusNames[erpStatus]}</span></button>`;
        }).join('');
        return `<article class="staff-booking"><h3>${esc(quest)}</h3><div class="staff-slots">${slotButtons}</div></article>`;
      }).join('');
    });

    grid.addEventListener('click', event => {
      const slot = event.target.closest('.staff-slot'); if (!slot) return;
      if (slot.dataset.bookingId) showDatabaseBooking(bookingById.get(slot.dataset.bookingId));
      else if (slot.dataset.erpKey) showErpSlot(erpSlotByKey.get(slot.dataset.erpKey));
    });
  }

})();
