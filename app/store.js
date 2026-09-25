/* ============================================================
   BODIMENTOR PT — data layer & business logic
   Semua data disimpan di localStorage (per perangkat).
   Untuk produksi: ganti load()/save() dengan API backend,
   dan checkout() dengan payment gateway (Midtrans / Xendit).
   ============================================================ */
window.PT = (function () {
  'use strict';

  const KEY = 'bmpt.v1';
  const DAY = 864e5;

  const CONFIG = {
    trialDays: 7,
    remindDays: 3,   // pengingat pop-up mulai H-3
    bannerDays: 7,   // banner "mau habis" untuk paket berbayar
    // Harga harus sama dengan bundle Scalev (scalev.js). Pembayaran: QRIS / Virtual Account via Scalev.
    plans: [
      { id: 'monthly', name: 'Bulanan', price: 99000, days: 30, per: '/bulan' },
    ],
    goals: ['Turun lemak', 'Naik massa otot', 'Naik berat badan', 'Kekuatan & performa', 'Kebugaran & kesehatan', 'Rehabilitasi'],
    types: ['Gym (1-on-1)', 'Home visit', 'Online coaching', 'Kelas / grup', 'Hybrid'],
    levels: ['Pemula', 'Menengah', 'Lanjutan'],
  };

  /* ---------- persistence ----------
     Cache lokal per akun (bmpt.v1:<userId>). Kalau server aktif, app.js
     memasang onSave() untuk mengirim dokumen ke server (debounce). */
  const blank = () => ({ v: 1, account: null, clients: [], programs: [], sessions: [], measurements: [], invoices: [], customExercises: [], draft: null, updatedAt: 0 });
  let key = KEY, hook = null;
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(key) || 'null');
      if (s && s.v === 1) return Object.assign(blank(), s);
    } catch (e) { /* corrupted → start fresh */ }
    return blank();
  }
  let S = load();
  function save() {
    S.updatedAt = Date.now();
    let ok = true;
    try { localStorage.setItem(key, JSON.stringify(S)); }
    catch (e) { console.error('save failed', e); ok = false; }
    if (hook) hook(S);
    return ok;
  }
  // Pindah ke data milik akun yang login. Data lama tanpa akun (bmpt.v1) dibawa sekali.
  function bind(userId) {
    key = KEY + ':' + userId;
    if (!localStorage.getItem(key) && localStorage.getItem(KEY)) {
      try { localStorage.setItem(key, localStorage.getItem(KEY)); localStorage.removeItem(KEY); } catch (e) { }
    }
    S = load(); fixIds();
  }
  // Perbaiki data lama: gerakan buatan tanpa id
  function fixIds() { (S.customExercises || []).forEach(x => { if (!x.id) x.id = uid('x'); }); }
  function replace(doc) {
    if (!doc || doc.v !== 1) return false;
    S = Object.assign(blank(), doc); fixIds();
    try { localStorage.setItem(key, JSON.stringify(S)); } catch (e) { }
    return true;
  }
  const onSave = fn => { hook = fn; };
  let seq = 0;
  const uid = p => p + Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 5);

  /* ---------- dates (all stored as 'YYYY-MM-DD') ---------- */
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => iso(new Date());
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / DAY);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthKey = s => s.slice(0, 7);
  const monthLabel = (k, full) => { const [y, m] = k.split('-').map(Number); return (full ? MONTHS_FULL : MONTHS)[m - 1] + ' ' + y; };
  const prevMonth = k => { let [y, m] = k.split('-').map(Number); m--; if (!m) { m = 12; y--; } return `${y}-${pad(m)}`; };
  const fmtDate = (s, year = true) => { const d = parse(s); return d.getDate() + ' ' + MONTHS[d.getMonth()] + (year ? ' ' + d.getFullYear() : ''); };
  const fmtDateLong = s => { const d = parse(s); return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };
  const fmtTs = ts => fmtDate(iso(new Date(ts)));
  function ago(s) {
    const n = daysBetween(s, today());
    if (n <= 0) return 'hari ini';
    if (n === 1) return 'kemarin';
    if (n < 14) return n + ' hari lalu';
    if (n < 60) return Math.floor(n / 7) + ' minggu lalu';
    return Math.floor(n / 30) + ' bulan lalu';
  }

  /* ---------- account & subscription ---------- */
  function createAccount(d) {
    const now = Date.now();
    S.account = {
      name: d.name.trim(), gym: (d.gym || '').trim(), phone: (d.phone || '').trim(), email: (d.email || '').trim(),
      createdAt: now, trialEnd: now + CONFIG.trialDays * DAY, paidUntil: 0, plan: '', lastReminder: '', notif: false,
    };
    save();
  }
  function updateAccount(d) { Object.assign(S.account, d); save(); }

  function sub() {
    const a = S.account; if (!a) return null;
    const now = Date.now();
    const left = end => Math.max(0, daysBetween(today(), iso(new Date(end))));  // hari kalender; 0 = berakhir hari ini
    if (a.paidUntil > now) return { status: 'active', end: a.paidUntil, daysLeft: left(a.paidUntil), plan: CONFIG.plans.find(p => p.id === a.plan) };
    if (!a.paidUntil && a.trialEnd > now) return { status: 'trial', end: a.trialEnd, daysLeft: left(a.trialEnd), total: CONFIG.trialDays };
    return { status: 'expired', end: a.paidUntil || a.trialEnd, daysLeft: 0, wasTrial: !a.paidUntil };
  }
  // Pengingat muncul max 1x per hari saat sisa <= remindDays atau sudah habis
  function reminderDue() {
    const s = sub(); if (!s) return null;
    if (S.account.lastReminder === today()) return null;
    if (s.status === 'expired' || s.daysLeft <= CONFIG.remindDays) return s;
    return null;
  }
  function markReminded() { S.account.lastReminder = today(); save(); }

  // Masa aktif baru disambung setelah trial / paket berjalan, jadi sisa hari gak hangus.
  function paidStart() {
    const a = S.account, now = Date.now();
    return Math.max(now, a.paidUntil || 0, (!a.paidUntil && a.trialEnd > now) ? a.trialEnd : 0);
  }
  // Order Scalev yang lagi nunggu dibayar (disimpan biar bisa dilanjut setelah buka app bank / e-wallet)
  function setPending(p) { S.account.pending = p || null; save(); }
  // Aktifkan 30 hari dari order Scalev yang sudah LUNAS. Idempoten per order: dipanggil berkali-kali tetap sekali tambah.
  // serverSub: hasil verifikasi server ({ trialEnd, paidUntil }) → masa aktif mengikuti server
  function activate(v, methodLabel, serverSub) {
    const a = S.account, plan = CONFIG.plans[0];
    if (serverSub) { if (serverSub.trialEnd) a.trialEnd = serverSub.trialEnd; a.paidUntil = serverSub.paidUntil || a.paidUntil; a.plan = plan.id; }
    const done = S.invoices.find(i => i.id === v.orderId);
    if (done) { a.pending = null; save(); return done; }
    const end = serverSub && serverSub.paidUntil ? serverSub.paidUntil : paidStart() + plan.days * DAY;
    const start = end - plan.days * DAY;
    a.paidUntil = end; a.plan = plan.id; a.lastReminder = ''; a.pending = null;
    const inv = { id: v.orderId, slug: v.slug, date: Date.now(), planId: plan.id, planName: plan.name, amount: v.total || plan.price, method: methodLabel || v.method, start, end, status: 'Lunas' };
    S.invoices.unshift(inv);
    save();
    return inv;
  }
  // Alat uji — hapus sebelum rilis
  function simulate(kind) {
    const a = S.account, now = Date.now();
    if (kind === 'trial2') { a.paidUntil = 0; a.plan = ''; a.trialEnd = now + 1.5 * DAY; }
    if (kind === 'expired') { a.paidUntil = 0; a.plan = ''; a.trialEnd = now - DAY; }
    if (kind === 'paid5') { a.paidUntil = now + 4.5 * DAY; a.plan = a.plan || 'monthly'; }
    if (kind === 'reset') { a.paidUntil = 0; a.plan = ''; a.trialEnd = now + CONFIG.trialDays * DAY; a.pending = null; S.invoices = []; }
    a.lastReminder = '';
    save();
  }

  /* ---------- clients ---------- */
  const client = id => S.clients.find(c => c.id === id);
  function addClient(d) { const c = Object.assign({ id: uid('c'), createdAt: Date.now(), active: true }, d); S.clients.unshift(c); save(); return c; }
  function updateClient(id, d) { Object.assign(client(id), d); save(); }
  function removeClient(id) {
    S.clients = S.clients.filter(c => c.id !== id);
    S.sessions = S.sessions.filter(s => s.clientId !== id);
    S.measurements = S.measurements.filter(m => m.clientId !== id);
    if (S.draft && S.draft.clientId === id) S.draft = null;
    save();
  }
  const age = c => c.birthYear ? new Date().getFullYear() - c.birthYear : null;

  /* ---------- programs ---------- */
  const program = id => S.programs.find(p => p.id === id);
  function saveProgram(p) {
    if (!p.id) { p.id = uid('p'); S.programs.push(p); }
    else { const i = S.programs.findIndex(x => x.id === p.id); if (i >= 0) S.programs[i] = p; else S.programs.push(p); }
    save(); return p;
  }
  function removeProgram(id) {
    S.programs = S.programs.filter(p => p.id !== id);
    S.clients.forEach(c => { if (c.programId === id) c.programId = ''; });
    save();
  }
  const programClients = id => S.clients.filter(c => c.programId === id);

  /* ---------- sessions ---------- */
  const sessionsOf = cid => S.sessions.filter(s => s.clientId === cid)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  function saveSession(s) {
    if (!s.id) { s.id = uid('s'); s.createdAt = Date.now(); S.sessions.push(s); }
    else { const i = S.sessions.findIndex(x => x.id === s.id); S.sessions[i] = Object.assign(S.sessions[i], s); }
    save(); return s;
  }
  function removeSession(id) { S.sessions = S.sessions.filter(s => s.id !== id); save(); }

  /* ---------- foto progres klien (disimpan per sesi) ---------- */
  // [{ id, pose, date, sessionId }] urut dari yang paling lama
  function photosOf(cid) {
    const out = [];
    S.sessions.filter(s => s.clientId === cid && s.photos && s.photos.length).sort((a, b) => a.date.localeCompare(b.date))
      .forEach(s => s.photos.forEach(p => out.push({ id: p.id, pose: p.pose || 'depan', date: s.date, sessionId: s.id })));
    return out;
  }
  // Before–after: foto pertama vs terbaru s/d tanggal tertentu, utamakan pose yang sama (depan dulu)
  function beforeAfter(cid, uptoDate) {
    const all = photosOf(cid).filter(p => !uptoDate || p.date <= uptoDate);
    for (const pose of ['depan', 'samping', 'belakang']) {
      const ps = all.filter(p => p.pose === pose);
      if (ps.length >= 2 && ps[0].date !== ps[ps.length - 1].date) return { before: ps[0], after: ps[ps.length - 1], all: ps };
    }
    return all.length >= 2 && all[0].date !== all[all.length - 1].date ? { before: all[0], after: all[all.length - 1], all } : null;
  }
  const sessionPhotoIds = id => { const s = S.sessions.find(x => x.id === id); return s && s.photos ? s.photos.map(p => p.id) : []; };
  const clientPhotoIds = cid => photosOf(cid).map(p => p.id);

  /* ---------- gerakan buatan PT sendiri (nama, otot, alat, foto, catatan) ---------- */
  const customEx = name => (S.customExercises || []).find(e => e.name.toLowerCase() === String(name || '').toLowerCase());
  const customExById = id => (S.customExercises || []).find(e => e.id === id);
  function saveCustomEx(d) {
    S.customExercises = S.customExercises || [];
    let e = d.id && customExById(d.id);
    if (e) {
      const old = e.name;
      Object.assign(e, d);
      if (old !== e.name) {   // ganti nama → ikut ganti di sesi & program
        S.sessions.forEach(s => s.exercises.forEach(x => { if (x.name === old) x.name = e.name; }));
        S.programs.forEach(p => p.days.forEach(dy => dy.exercises.forEach(x => { if (x.name === old) x.name = e.name; })));
      }
    } else {
      e = Object.assign({ createdAt: Date.now() }, d, { id: uid('x') });
      S.customExercises.unshift(e);
    }
    save(); return e;
  }
  function removeCustomEx(id) { S.customExercises = (S.customExercises || []).filter(e => e.id !== id); save(); }

  const volume = s => s.exercises.reduce((t, e) => t + e.sets.reduce((u, x) => u + (x[0] || 0) * (x[1] || 0), 0), 0);
  const setCount = s => s.exercises.reduce((t, e) => t + e.sets.length, 0);
  // Set terberat (kg terbesar; kalau sama, reps terbanyak)
  const best = sets => sets.reduce((b, x) => (!b || x[0] > b[0] || (x[0] === b[0] && x[1] > b[1])) ? x : b, null);
  const better = (a, b) => !b || a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
  const e1rm = x => x[0] * (1 + x[1] / 30);

  // Performa terakhir sebuah gerakan (sesi terbaru yang memuat gerakan tsb)
  function lastOf(cid, name, excludeId) {
    for (const s of sessionsOf(cid)) {
      if (s.id === excludeId) continue;
      const e = s.exercises.find(x => x.name === name);
      if (e && e.sets.length) return { date: s.date, sets: e.sets, best: best(e.sets) };
    }
    return null;
  }
  // Semua gerakan klien + riwayat, PR, pertama & terakhir
  function lifts(cid) {
    const map = new Map();
    for (const s of sessionsOf(cid).slice().reverse()) {
      for (const e of s.exercises) {
        if (!e.sets.length) continue;
        const b = best(e.sets);
        let L = map.get(e.name);
        if (!L) { L = { name: e.name, count: 0, first: { date: s.date, best: b }, pr: { date: s.date, best: b }, history: [] }; map.set(e.name, L); }
        L.count++;
        L.last = { date: s.date, best: b, sets: e.sets };
        L.history.push({ date: s.date, best: b, sets: e.sets });
        if (better(b, L.pr.best)) L.pr = { date: s.date, best: b };
      }
    }
    return [...map.values()].sort((a, b) => b.last.date.localeCompare(a.last.date) || b.count - a.count);
  }
  // Gerakan yang jadi PR baru di sesi ini (dibanding semua sesi sebelumnya)
  function detectPRs(cid, exercises, excludeId) {
    const prev = new Map();
    for (const s of S.sessions) {
      if (s.clientId !== cid || s.id === excludeId) continue;
      for (const e of s.exercises) { const b = best(e.sets); if (b && better(b, prev.get(e.name))) prev.set(e.name, b); }
    }
    const out = [];
    for (const e of exercises) {
      const b = best(e.sets), p = prev.get(e.name);
      if (b && p && b[0] > p[0]) out.push({ name: e.name, kg: b[0], from: p[0] });
    }
    return out;
  }
  // Hari program berikutnya (lanjut dari sesi terakhir)
  function nextDay(cid, prog) {
    if (!prog || !prog.days.length) return null;
    const last = sessionsOf(cid).find(s => s.programId === prog.id);
    if (!last) return prog.days[0];
    const i = prog.days.findIndex(d => d.name === last.dayName);
    return prog.days[(i + 1) % prog.days.length];
  }
  // Gerakan yang paling sering dipakai coach (buat "sering dipakai" di picker)
  function topExercises(n) {
    const cnt = new Map();
    S.sessions.forEach(s => s.exercises.forEach(e => cnt.set(e.name, (cnt.get(e.name) || 0) + 1)));
    S.programs.forEach(p => p.days.forEach(d => d.exercises.forEach(e => cnt.set(e.name, (cnt.get(e.name) || 0) + 1))));
    return [...cnt.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(x => x[0]);
  }

  /* ---------- body measurements ---------- */
  const measuresOf = cid => S.measurements.filter(m => m.clientId === cid).sort((a, b) => a.date.localeCompare(b.date));
  function addMeasure(m) { m.id = uid('m'); S.measurements.push(m); save(); return m; }
  function removeMeasure(id) { S.measurements = S.measurements.filter(m => m.id !== id); save(); }
  // Ukuran terakhir yang tercatat s/d akhir bulan `key`
  function measureAt(cid, key) {
    const ms = measuresOf(cid).filter(m => monthKey(m.date) <= key);
    return ms[ms.length - 1] || null;
  }

  /* ---------- status klien ---------- */
  function status(c) {
    const ss = sessionsOf(c.id);
    const last = ss[0] || null;
    const since = last ? daysBetween(last.date, today()) : null;
    let pkgLeft = null;
    if (c.pkgTotal) pkgLeft = c.pkgTotal - ss.filter(s => !c.pkgStart || s.date >= c.pkgStart).length;
    const createdDays = daysBetween(iso(new Date(c.createdAt)), today());
    const follow = !!c.active && ((since !== null && since >= 7) || (since === null && createdDays >= 3));
    const pkgLow = !!c.active && pkgLeft !== null && pkgLeft <= 2;
    return { last, since, pkgLeft, follow, pkgLow, count: ss.length };
  }

  /* ---------- rekap bulanan (dipakai layar klien & laporan PDF) ---------- */
  function monthStats(cid, key, uptoDay) {
    const lim = uptoDay ? `${key}-${pad(uptoDay)}` : null;
    const ss = sessionsOf(cid).filter(s => monthKey(s.date) === key && (!lim || s.date <= lim));
    const vol = ss.reduce((t, s) => t + volume(s), 0);
    const liftBest = {};
    for (const s of ss) for (const e of s.exercises) {
      const b = best(e.sets); if (b && better(b, liftBest[e.name])) liftBest[e.name] = b;
    }
    const m = measureAt(cid, key);
    return {
      key, label: monthLabel(key), sessions: ss.length, volume: vol, avgVol: ss.length ? vol / ss.length : 0,
      sets: ss.reduce((t, s) => t + setCount(s), 0),
      weight: m ? m.weight : null, bodyFat: m && m.bodyFat != null ? m.bodyFat : null, waist: m && m.waist != null ? m.waist : null,
      lifts: liftBest,
    };
  }
  // Bulan berjalan belum lengkap → dibanding periode yang sama bulan lalu (mis. 1–25 Agu vs 1–25 Sep)
  const partialDay = key => key === monthKey(today()) ? +today().slice(8, 10) : null;
  const daysIn = k => { const [y, m] = k.split('-').map(Number); return new Date(y, m, 0).getDate(); };
  function prevStats(cid, key) {
    const pk = prevMonth(key), d = partialDay(key);
    return d ? monthStats(cid, pk, Math.min(d, daysIn(pk))) : monthStats(cid, pk);
  }
  // Label pembanding: "Agu" atau "1–25 Agu" untuk bulan berjalan
  function vsLabel(key) {
    const pk = prevMonth(key), d = partialDay(key), pm = monthLabel(pk).split(' ')[0];
    return d ? `1–${Math.min(d, daysIn(pk))} ${pm}` : pm;
  }
  // Bulan pertama klien punya data
  function firstMonth(cid) {
    const ss = S.sessions.filter(s => s.clientId === cid).map(s => s.date);
    const ms = S.measurements.filter(m => m.clientId === cid).map(m => m.date);
    const all = ss.concat(ms).sort();
    return all.length ? monthKey(all[0]) : monthKey(today());
  }
  function monthsWithData(cid) {
    const out = [], first = firstMonth(cid);
    let k = monthKey(today());
    while (k >= first && out.length < 36) { out.push(k); k = prevMonth(k); }
    return out; // terbaru dulu
  }

  /* ---------- backup ---------- */
  const exportJSON = () => JSON.stringify(S);
  function importJSON(str) {
    const d = JSON.parse(str);
    if (!d || d.v !== 1 || !Array.isArray(d.clients)) throw new Error('Format file tidak dikenali');
    S = Object.assign(blank(), d); save();
  }
  function removeDemo() {
    const ids = new Set(S.clients.filter(c => c.demo).map(c => c.id));
    S.clients = S.clients.filter(c => !ids.has(c.id));
    S.sessions = S.sessions.filter(s => !ids.has(s.clientId));
    S.measurements = S.measurements.filter(m => !ids.has(m.clientId));
    save();
  }
  function resetAll() { S = blank(); try { localStorage.removeItem(key); } catch (e) { } }

  return {
    CONFIG, DAY, get S() { return S; }, save, uid, bind, replace, onSave,
    photosOf, beforeAfter, sessionPhotoIds, clientPhotoIds, customEx, customExById, saveCustomEx, removeCustomEx,
    // dates
    iso, today, parse, addDays, daysBetween, monthKey, monthLabel, prevMonth, fmtDate, fmtDateLong, fmtTs, ago, MONTHS, MONTHS_FULL,
    // account
    createAccount, updateAccount, sub, reminderDue, markReminded, paidStart, setPending, activate, simulate,
    // data
    client, addClient, updateClient, removeClient, age,
    program, saveProgram, removeProgram, programClients,
    sessionsOf, saveSession, removeSession, volume, setCount, best, better, e1rm, lastOf, lifts, detectPRs, nextDay, topExercises,
    measuresOf, addMeasure, removeMeasure, measureAt,
    status, monthStats, partialDay, prevStats, vsLabel, firstMonth, monthsWithData,
    exportJSON, importJSON, removeDemo, resetAll,
  };
})();
