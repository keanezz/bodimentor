/* ============================================================
   BODIMENTOR PT — akun & sinkron data
   • Supabase aktif (config.js terisi): login email+password, email
     konfirmasi & reset password, data & foto tersimpan di server,
     status langganan dibaca dari server (tidak bisa diubah dari HP).
   • Mode lokal (config.js kosong): akun & data hanya di perangkat ini.
   ============================================================ */
window.Cloud = (function () {
  'use strict';
  const cfg = window.PT_CONFIG || {};
  const bootHash = location.hash;   // ditangkap sebelum Supabase membersihkan token di URL
  const configured = !!(cfg.supabaseUrl || cfg.supabaseAnonKey);
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase && window.supabase.createClient);
  const unavailable = configured && !enabled;
  const assertReady = () => { if (unavailable) throw new Error('Koneksi akun belum siap. Periksa internet lalu muat ulang aplikasi.'); };
  const sb = enabled ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit', storageKey: 'bmpt-auth' },
  }) : null;
  let user = null, recovery = /type=recovery/.test(bootHash);
  if (sb) sb.auth.onAuthStateChange((ev, session) => {
    if (ev === 'PASSWORD_RECOVERY') recovery = true;
    user = session ? session.user : null;
  });
  const appUrl = () => location.origin + location.pathname;

  function msg(e) {
    const m = String((e && (e.message || e.error_description)) || e || '');
    if (/invalid login credentials/i.test(m)) return 'Email atau password salah.';
    if (/email not confirmed/i.test(m)) return 'Email belum dikonfirmasi. Buka link konfirmasi di inbox (cek juga folder spam).';
    if (/already registered|already been registered|user already exists/i.test(m)) return 'Email ini sudah terdaftar. Silakan masuk, atau pakai "Lupa password".';
    if (/password.*(at least|characters)|weak/i.test(m)) return 'Password minimal 8 karakter.';
    if (/rate limit|too many|security purposes/i.test(m)) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
    if (/different from the old|same password/i.test(m)) return 'Password baru harus beda dari password lama.';
    if (/failed to fetch|network|load failed/i.test(m)) return 'Gak bisa terhubung ke server. Cek koneksi internet.';
    if (/expired|invalid.*(token|link)|otp/i.test(m)) return 'Link sudah kedaluwarsa atau tidak valid. Minta link baru.';
    return m || 'Terjadi kesalahan. Coba lagi.';
  }
  async function run(p) {
    let res;
    try { res = await p; } catch (e) { throw new Error(msg(e)); }
    if (res && res.error) throw new Error(msg(res.error));
    return res ? res.data : null;
  }

  /* ---------- mode lokal (tanpa server) ---------- */
  const LK = 'bmpt.local-auth';
  const lget = () => { try { return JSON.parse(localStorage.getItem(LK)) || { users: {}, session: null }; } catch (e) { return { users: {}, session: null }; } };
  const lset = v => localStorage.setItem(LK, JSON.stringify(v));
  // Bukan pengaman sungguhan — mode lokal hanya untuk mencoba app di satu perangkat.
  const lhash = s => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
  const localUser = (email, u) => ({ id: u.id, email, user_metadata: u.meta || {} });

  /* ---------- auth ---------- */
  async function init() {
    assertReady();
    if (!sb) {
      const d = lget();
      user = d.session && d.users[d.session] ? localUser(d.session, d.users[d.session]) : null;
      return { user, recovery: false };
    }
    const data = await run(sb.auth.getSession());
    user = data && data.session ? data.session.user : null;
    if (/access_token|error_description/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    const err = /error_description=([^&]+)/.exec(bootHash);
    return { user, recovery: recovery && !!user, error: err ? msg(decodeURIComponent(err[1].replace(/\+/g, ' '))) : null };
  }
  async function signUp(email, password, meta) {
    assertReady();
    email = email.trim().toLowerCase();
    if (!sb) {
      const d = lget();
      if (d.users[email]) throw new Error(msg('already registered'));
      const u = { id: 'local-' + Date.now().toString(36), pw: lhash(email + '|' + password), meta, createdAt: Date.now() };
      d.users[email] = u; d.session = email; lset(d);
      user = localUser(email, u);
      return { user, needsConfirm: false };
    }
    const data = await run(sb.auth.signUp({ email, password, options: { emailRedirectTo: appUrl(), data: meta } }));
    // Supabase tidak membocorkan email yang sudah terdaftar: identities kosong = sudah ada
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new Error(msg('already registered'));
    user = data.session ? data.user : null;
    return { user, needsConfirm: !data.session };
  }
  async function signIn(email, password) {
    assertReady();
    email = email.trim().toLowerCase();
    if (!sb) {
      const d = lget(), u = d.users[email];
      if (!u || u.pw !== lhash(email + '|' + password)) throw new Error(msg('invalid login credentials'));
      d.session = email; lset(d); user = localUser(email, u);
      return user;
    }
    const data = await run(sb.auth.signInWithPassword({ email, password }));
    user = data.user;
    return user;
  }
  async function signOut() {
    if (!sb) { const d = lget(); d.session = null; lset(d); user = null; return; }
    await sb.auth.signOut().catch(() => { });
    user = null;
  }
  async function requestReset(email) {
    assertReady();
    if (!sb) throw new Error('Reset password lewat email aktif setelah server (Supabase) tersambung.');
    await run(sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: appUrl() }));
  }
  async function setPassword(password) {
    assertReady();
    if (!sb) {
      const d = lget(), u = user && d.users[user.email];
      if (!u) throw new Error('Silakan masuk dulu.');
      u.pw = lhash(user.email + '|' + password); lset(d); return;
    }
    await run(sb.auth.updateUser({ password }));
    recovery = false;
  }

  /* ---------- data (satu dokumen JSON per akun) ---------- */
  async function loadDoc() {
    if (!sb || !user) return null;
    return run(sb.from('pt_data').select('data, updated_at').eq('user_id', user.id).maybeSingle());
  }
  async function saveDoc(doc) {
    if (!sb || !user) return;
    await run(sb.from('pt_data').upsert({ user_id: user.id, data: doc, updated_at: new Date().toISOString() }));
  }

  /* ---------- langganan (sumber kebenaran: server) ---------- */
  const ms = t => t ? new Date(t).getTime() : 0;
  async function getSub() {
    if (!sb || !user) return null;
    const r = await run(sb.from('subscriptions').select('trial_end, paid_until').eq('user_id', user.id).maybeSingle());
    return r ? { trialEnd: ms(r.trial_end), paidUntil: ms(r.paid_until) } : null;
  }
  async function activate(slug) {
    if (!sb || !user) return null;
    const r = await run(sb.rpc('activate_scalev_order', { p_slug: slug }));
    const row = Array.isArray(r) ? r[0] : r;
    return row ? { trialEnd: ms(row.trial_end), paidUntil: ms(row.paid_until) } : null;
  }
  async function payments() {
    if (!sb || !user) return [];
    const r = await run(sb.from('payments').select('order_id, amount, method, created_at, period_start, period_end').order('created_at', { ascending: false }));
    return r || [];
  }

  /* ---------- foto ---------- */
  const QK = 'bmpt.photo-queue';
  const qget = () => { try { return JSON.parse(localStorage.getItem(QK)) || []; } catch (e) { return []; } };
  const qset = v => localStorage.setItem(QK, JSON.stringify([...new Set(v)]));
  const path = id => `${user.id}/${id}.jpg`;
  async function uploadPhoto(id, blob) {
    if (!sb || !user) return;
    try { await run(sb.storage.from('photos').upload(path(id), blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '31536000' })); }
    catch (e) { qset(qget().concat(id)); throw e; }
    qset(qget().filter(x => x !== id));
  }
  async function downloadPhoto(id) {
    if (!sb || !user) return null;
    return run(sb.storage.from('photos').download(path(id)));
  }
  async function deletePhoto(id) {
    if (!sb || !user) return;
    await run(sb.storage.from('photos').remove([path(id)]));
  }
  // Unggah ulang foto yang tertunda (mis. diambil saat sinyal gym jelek)
  async function flushPhotos() {
    if (!sb || !user) return;
    for (const id of qget()) {
      const b = await window.Photos.blob(id).catch(() => null);
      if (b) await uploadPhoto(id, b).catch(() => { }); else qset(qget().filter(x => x !== id));
    }
  }

  return {
    enabled, unavailable, get user() { return user; }, get recovery() { return recovery; },
    init, signUp, signIn, signOut, requestReset, setPassword,
    loadDoc, saveDoc, getSub, activate, payments,
    uploadPhoto, downloadPhoto, deletePhoto, flushPhotos,
  };
})();
