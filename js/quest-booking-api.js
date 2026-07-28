// Все адреса внешнего бронирования хранятся только в этом файле.
// Для подключения следующего квеста заполните четыре поля его объекта.
(function () {
  'use strict';

  const QUEST_API_URLS = {
    'Стоматология "Новая жизнь"': {
      timetable: '/api/my-erp/timetable/4893.json',
      book: '/api/my-erp/book/4893',
      tariff: '/api/my-erp/get_tariff/4893',
      tariffWithPlayers: '/api/my-erp/get_tariff_with_players/4893'
    },
    'Рик и Морти': null,
    'K-pop: последний стрим': null,
    'Хоррор-свидание': null,
    'Запретная дверь': null,
    'Изнанка в разуме Векны': null,
    'Among Us': null,
    'Невеста': null,
    'Хогвартс': null,
    'Лабубу: волшебный мир': null,
    'Монастырь': null,
    'Гринч': null,
    'Хоррор-вечер': null
  };

  const schedules = new Map();
  const states = new Map();

  function getConfig(questName) {
    return QUEST_API_URLS[questName] || null;
  }

  function toDateKey(value) {
    const text = String(value || '');
    let match = text.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    match = text.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    return match ? `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` : '';
  }

  function normalizeSchedule(payload) {
    const schedule = new Map();

    function addSlot(dateHint, value) {
      const date = toDateKey(value.date || value.day || value.datetime || value.start || dateHint);
      const timeValue = value.time || value.start_time || value.datetime || value.start;
      const timeMatch = String(timeValue || '').match(/(\d{1,2}:\d{2})/);
      if (!date || !timeMatch) return;

      const time = timeMatch[1].padStart(5, '0');
      const unavailable = value.available === false || value.available === 0 ||
        value.free === false || value.free === 0 || value.is_free === false ||
        value.is_free === 0 || value.busy === true || value.booked === true ||
        ['busy', 'booked', 'closed'].includes(String(value.status || '').toLowerCase());
      const slot = {
        time,
        price: Number(value.price ?? value.tariff ?? value.cost ?? 0) || 0,
        available: !unavailable,
        id: value.id ?? value.slot_id ?? value.session_id ?? ''
      };
      const daySlots = schedule.get(date) || [];
      const oldSlot = daySlots.find(item => item.time === time);
      if (oldSlot) Object.assign(oldSlot, slot);
      else daySlots.push(slot);
      schedule.set(date, daySlots);
    }

    function walk(value, dateHint) {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach(item => walk(item, dateHint));
        return;
      }
      if (typeof value !== 'object') return;

      const ownDate = toDateKey(value.date || value.day || value.datetime || value.start) || dateHint;
      if (value.time || value.start_time || /\d{1,2}:\d{2}/.test(String(value.datetime || value.start || ''))) {
        addSlot(ownDate, value);
      }
      Object.entries(value).forEach(([key, child]) => walk(child, toDateKey(key) || ownDate));
    }

    walk(payload, '');
    schedule.forEach(slots => slots.sort((a, b) => a.time.localeCompare(b.time)));
    return schedule;
  }

  async function load(questName) {
    const config = getConfig(questName);
    if (!config) return null;

    states.set(questName, { loading: true, loaded: false, error: '' });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(config.timetable, {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const schedule = normalizeSchedule(await response.json());
      if (!schedule.size) throw new Error('API вернуло пустое расписание');
      schedules.set(questName, schedule);
      states.set(questName, { loading: false, loaded: true, error: '' });
      return schedule;
    } catch (error) {
      schedules.delete(questName);
      states.set(questName, {
        loading: false,
        loaded: false,
        error: 'Не удалось получить расписание my-ERP. Показано резервное расписание.'
      });
      console.error('Ошибка расписания my-ERP:', error);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  function getState(questName) {
    return states.get(questName) || { loading: false, loaded: false, error: '' };
  }

  function getSlots(questName, date) {
    return schedules.get(questName)?.get(date) || [];
  }

  function getSlot(questName, date, time) {
    return getSlots(questName, date).find(slot => slot.time === time) || null;
  }

  async function book(questName, booking) {
    const config = getConfig(questName);
    if (!config) return { success: true, local: true };
    const response = await fetch(config.book, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams(booking).toString()
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false || result.error) {
      throw new Error(result.error || result.message || `HTTP ${response.status}`);
    }
    return result;
  }

  window.QuestBookingApi = {
    urls: QUEST_API_URLS,
    getConfig,
    getState,
    getSlots,
    getSlot,
    load,
    book
  };
}());
