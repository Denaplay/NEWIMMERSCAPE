(async function initProfile() {
  'use strict';

  const config = window.IMMERSCAPE_SUPABASE_CONFIG;
  const library = window.supabase || window.ImmerscapeSupabaseAuth;
  const client = library?.createClient(config?.url, config?.publishableKey);
  const form = document.getElementById('profileForm');
  const message = document.getElementById('profileMessage');
  const content = document.getElementById('profileContent');
  const loading = document.getElementById('profileLoading');
  if (!client || !form) return;

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  const session = sessionData.session;
  if (!session?.user) {
    loading.textContent = sessionError?.message || 'Сначала войдите в аккаунт.';
    setTimeout(() => { window.location.href = 'index.html#auth'; }, 900);
    return;
  }

  const user = session.user;
  const { data: profile, error } = await client.profiles.get(user.id);
  loading.hidden = true;
  content.hidden = false;
  form.elements.fullName.value = profile?.full_name || user.user_metadata?.full_name || '';
  form.elements.phone.value = profile?.phone || user.user_metadata?.phone || '';
  document.getElementById('profileEmail').textContent = user.email || '—';
  document.getElementById('profileVisits').textContent = String(profile?.visits_count ?? 0);
  if (profile?.permission) {
    document.getElementById('staffActions').hidden = false;
    document.getElementById('staffClientsLink').hidden = profile.permission === 'operator';
  }
  document.getElementById('profileAvatar').textContent = (form.elements.fullName.value || user.email || 'И').trim().charAt(0).toUpperCase();
  if (error) {
    message.textContent = `Не удалось загрузить профиль: ${error.message}. Если таблица ещё не создана, запустите supabase/schema.sql.`;
    message.className = 'profile-message error';
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const fullName = form.elements.fullName.value.trim();
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    message.textContent = 'Сохраняем…';
    message.className = 'profile-message';
    const [profileResult, userResult] = await Promise.all([
      client.profiles.update(user.id, { full_name: fullName }),
      client.auth.updateUser({ data: { ...(user.user_metadata || {}), full_name: fullName } })
    ]);
    submit.disabled = false;
    const saveError = profileResult.error || userResult.error;
    message.textContent = saveError ? saveError.message : 'Имя и фамилия сохранены.';
    message.className = `profile-message ${saveError ? 'error' : 'success'}`;
    if (!saveError) document.getElementById('profileAvatar').textContent = (fullName || 'И').charAt(0).toUpperCase();
  });

  document.getElementById('profileLogout').addEventListener('click', async () => {
    await client.auth.signOut();
    window.location.href = 'index.html';
  });
})();
