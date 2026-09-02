(function createSupabaseAuthClient(global) {
  'use strict';

  const storageKey = 'immerscape.supabase.session';

  function getStorage() {
    try {
      const testKey = `${storageKey}.test`;
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return localStorage;
    } catch (_error) {
      // В приватном режиме некоторые браузеры запрещают localStorage.
      return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
    }
  }

  async function parseResponse(response) {
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (_error) { data = { message: text }; }
    if (!response.ok) {
      const error = new Error(data.msg || data.message || data.error_description || `Ошибка Supabase (${response.status})`);
      error.status = response.status;
      error.code = data.error_code || data.code;
      throw error;
    }
    return data;
  }

  function createClient(url, publishableKey) {
    const listeners = new Set();
    const storage = getStorage();
    let session = null;
    try { session = JSON.parse(storage.getItem(storageKey) || 'null'); } catch (_error) { storage.removeItem(storageKey); }

    function save(nextSession, event) {
      session = nextSession;
      if (session) storage.setItem(storageKey, JSON.stringify(session));
      else storage.removeItem(storageKey);
      listeners.forEach(listener => listener(event, session));
    }

    async function request(path, options = {}) {
      const response = await fetch(`${url}/auth/v1${path}`, {
        ...options,
        headers: {
          apikey: publishableKey,
          'content-type': 'application/json',
          ...(options.headers || {})
        }
      });
      return parseResponse(response);
    }

    async function restRequest(path, options = {}) {
      await ensureFreshSession();
      const response = await fetch(`${url}/rest/v1${path}`, {
        ...options,
        headers: {
          apikey: publishableKey,
          'content-type': 'application/json',
          ...(session?.access_token ? { authorization: `Bearer ${session.access_token}` } : {}),
          ...(options.headers || {})
        }
      });
      return parseResponse(response);
    }

    function normalizeSession(data) {
      if (!data.access_token) return null;
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
        user: data.user
      };
    }

    async function refreshSession() {
      if (!session?.refresh_token) {
        save(null, 'SIGNED_OUT');
        throw new Error('Сессия истекла. Войдите в аккаунт повторно.');
      }
      try {
        const data = await request('/token?grant_type=refresh_token', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: session.refresh_token })
        });
        const nextSession = normalizeSession(data);
        if (!nextSession) throw new Error('Supabase не вернул новую сессию.');
        save(nextSession, 'TOKEN_REFRESHED');
        return nextSession;
      } catch (error) {
        save(null, 'SIGNED_OUT');
        throw error;
      }
    }

    async function ensureFreshSession() {
      if (!session) return null;
      const expiresAt = Number(session.expires_at) || 0;
      if (expiresAt > Math.floor(Date.now() / 1000) + 30) return session;
      return refreshSession();
    }

    const auth = {
      async signUp({ email, password, options = {} }) {
        try {
          const redirect = options.emailRedirectTo ? `?redirect_to=${encodeURIComponent(options.emailRedirectTo)}` : '';
          const data = await request(`/signup${redirect}`, { method: 'POST', body: JSON.stringify({ email, password, data: options.data || {} }) });
          const nextSession = normalizeSession(data);
          if (nextSession) save(nextSession, 'SIGNED_IN');
          return { data: { user: data.user || null, session: nextSession }, error: null };
        } catch (error) { return { data: { user: null, session: null }, error }; }
      },
      async signInWithPassword({ email, password }) {
        try {
          const data = await request('/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
          const nextSession = normalizeSession(data);
          save(nextSession, 'SIGNED_IN');
          return { data: { user: data.user, session: nextSession }, error: null };
        } catch (error) { return { data: { user: null, session: null }, error }; }
      },
      async resetPasswordForEmail(email, options = {}) {
        try {
          const redirect = options.redirectTo ? `?redirect_to=${encodeURIComponent(options.redirectTo)}` : '';
          await request(`/recover${redirect}`, { method: 'POST', body: JSON.stringify({ email }) });
          return { data: {}, error: null };
        } catch (error) { return { data: {}, error }; }
      },
      async resend({ type, email, options = {} }) {
        try {
          const redirect = options.emailRedirectTo ? `?redirect_to=${encodeURIComponent(options.emailRedirectTo)}` : '';
          const data = await request(`/resend${redirect}`, { method: 'POST', body: JSON.stringify({ type, email }) });
          return { data, error: null };
        } catch (error) { return { data: {}, error }; }
      },
      async signOut() {
        try {
          try { await ensureFreshSession(); } catch (_error) { /* локальный выход всё равно должен сработать */ }
          if (session?.access_token) await request('/logout', { method: 'POST', headers: { authorization: `Bearer ${session.access_token}` } });
          save(null, 'SIGNED_OUT');
          return { error: null };
        } catch (error) { save(null, 'SIGNED_OUT'); return { error }; }
      },
      async updateUser({ data }) {
        try {
          await ensureFreshSession();
          if (!session?.access_token) throw new Error('Необходимо войти в аккаунт.');
          const user = await request('/user', {
            method: 'PUT',
            headers: { authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ data })
          });
          save({ ...session, user }, 'USER_UPDATED');
          return { data: { user }, error: null };
        } catch (error) { return { data: { user: null }, error }; }
      },
      async getSession() {
        try {
          await ensureFreshSession();
          return { data: { session }, error: null };
        } catch (error) {
          return { data: { session: null }, error };
        }
      },
      onAuthStateChange(callback) {
        listeners.add(callback);
        return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
      }
    };
    const profiles = {
      async get(userId) {
        try {
          const rows = await restRequest(`/profiles?id=eq.${encodeURIComponent(userId)}&select=id,full_name,phone,visits_count,permission`);
          return { data: rows[0] || null, error: null };
        } catch (error) { return { data: null, error }; }
      },
      async update(userId, values) {
        try {
          const rows = await restRequest(`/profiles?id=eq.${encodeURIComponent(userId)}`, {
            method: 'PATCH',
            headers: { prefer: 'return=representation' },
            body: JSON.stringify(values)
          });
          return { data: rows[0] || null, error: null };
        } catch (error) { return { data: null, error }; }
      }
    };
    const staff = {
      async create(table, values) {
        try { return { data: await restRequest(`/${table}`, { method: 'POST', headers: { prefer: 'return=representation' }, body: JSON.stringify(values) }), error: null }; }
        catch (error) { return { data: null, error }; }
      },
      async list(table, query = '') {
        try { return { data: await restRequest(`/${table}?${query}`), error: null }; }
        catch (error) { return { data: [], error }; }
      },
      async update(table, id, values) {
        try { return { data: await restRequest(`/${table}?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { prefer: 'return=representation' }, body: JSON.stringify(values) }), error: null }; }
        catch (error) { return { data: null, error }; }
      },
      async remove(table, id) {
        try { await restRequest(`/${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }); return { error: null }; }
        catch (error) { return { error }; }
      },
      async rpc(name, values) {
        try { return { data: await restRequest(`/rpc/${name}`, { method: 'POST', body: JSON.stringify(values) }), error: null }; }
        catch (error) { return { data: null, error }; }
      }
    };
    return { auth, profiles, staff };
  }

  global.ImmerscapeSupabaseAuth = { createClient };
})(window);
