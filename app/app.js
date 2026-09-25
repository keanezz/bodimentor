/* ============================================================
   BODIMENTOR PT — UI (router, layar, modal)
   Menu cuma 3: Klien · Program · Akun
   ============================================================ */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : 0; };
  const fmt = (n, d = 0) => Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: d });
  const f1 = n => fmt(n, 1);
  const rp = n => 'Rp ' + fmt(n);
  const setTxt = x => x ? (x[0] ? `${f1(x[0])} kg × ${x[1]}` : `BW × ${x[1]}`) : '—';
  const firstName = s => String(s || '').trim().split(/\s+/)[0] || '';
  const initials = s => String(s || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const hue = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return [196, 178, 158, 128, 208, 186][h % 6]; };
  const shortName = n => n.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const weightDir = goal => /turun/i.test(goal || '') ? -1 : /naik/i.test(goal || '') ? 1 : 0;
  const expired = () => { const s = PT.sub(); return !!s && s.status === 'expired'; };
  const DEV = /[?&]dev\b/.test(location.search);
  const sisa = n => n > 0 ? `sisa ${n} hari` : 'berakhir hari ini';
  const lagi = n => n > 0 ? `${n} hari lagi` : 'hari ini';

  const I = {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    list: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    wa: '<path d="M3.5 20.5l1.3-4.1A8.5 8.5 0 1 1 8 19.3z"/><path d="M9.2 8.6c.3-.4.7-.5 1-.3l.9 2-.7 1a5.8 5.8 0 0 0 2.6 2.6l1-.7 2 .9c.2.3.1.7-.3 1-1.7 1.2-6.2-2.1-6.5-6.5z"/>',
    download: '<path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    upload: '<path d="M12 15V3m0 0L8 7m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    cal: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 3v3M16 3v3"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M17 20h4v-3"/>',
    bank: '<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/>',
    wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15v14H5a2 2 0 0 1-2-2V5"/><path d="M16 14h.01"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    scale: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 9a6 6 0 0 1 8 0l-2.5 3h-3z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8"/>',
  };
  const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;
  const avatar = (c, cls = '') => `<span class="avatar ${cls}" style="--h:${hue(c.name)}">${esc(initials(c.name))}</span>`;

  /* ---------- library gerakan (dipakai bareng app Bodimentor) ---------- */
  const LIB = (typeof EXERCISE_DATA !== 'undefined' && EXERCISE_DATA.exercises) || [];
  const LIBMAP = new Map(LIB.map(e => [e.name, e]));
  const GROUPS = [['all', 'Semua'], ['Chest', 'Dada'], ['Back', 'Punggung'], ['Legs', 'Kaki'], ['Glutes', 'Bokong'], ['Shoulders', 'Bahu'], ['Arms', 'Lengan'], ['Core', 'Core'], ['Cardio', 'Kardio']];
  const groupLabel = g => (GROUPS.find(x => x[0] === g) || [0, g === 'Other' ? 'Lainnya' : (g || 'Gerakan sendiri')])[1];
  const EQUIPS = ['Barbell', 'Dumbbell', 'Mesin', 'Kabel', 'Bodyweight', 'Kettlebell', 'Band', 'Lainnya'];
  // Info gerakan: gerakan buatan PT (foto & catatan sendiri) diutamakan, lalu library
  function exInfo(name) {
    const c = PT.customEx(name);
    if (c) return { name: c.name, group: c.group, equipment: c.equipment, photo: c.photo, notes: c.notes, custom: true, id: c.id };
    const e = LIBMAP.get(name);
    return e ? { name: e.name, group: e.group, equipment: e.equipment, img: e.img, desc: e.desc } : { name, group: '' };
  }
  function thumb(name, cls = '') {
    const e = exInfo(name);
    if (e.photo) return `<span class="thumb ph ${cls}"><img data-photo="${esc(e.photo)}" alt=""></span>`;
    return e.img
      ? `<span class="thumb ${cls}"><img src="${esc(e.img)}" alt="" loading="lazy" onerror="this.remove()"></span>`
      : `<span class="thumb ${cls}">${icon('dumbbell')}</span>`;
  }
  function searchEx(q, g) {
    q = q.trim().toLowerCase();
    const mine = (PT.S.customExercises || []).map(c => ({ name: c.name, group: c.group, equipment: c.equipment, custom: true }));
    const known = new Set(mine.map(e => e.name).concat(LIB.map(e => e.name)));
    const loose = new Set();   // nama lama yang dipakai di sesi/program tapi belum jadi gerakan buatan
    PT.S.sessions.forEach(s => s.exercises.forEach(e => { if (!known.has(e.name)) loose.add(e.name); }));
    PT.S.programs.forEach(p => p.days.forEach(d => d.exercises.forEach(e => { if (!known.has(e.name)) loose.add(e.name); })));
    let list = mine.concat([...loose].map(name => ({ name, group: '', custom: true })), LIB);
    if (g === 'mine') list = list.filter(e => e.custom);
    else if (g !== 'all') list = list.filter(e => e.group === g);
    if (!q) return list;
    const words = q.split(/\s+/);
    return list.filter(e => { const n = e.name.toLowerCase(); return words.every(w => n.includes(w)); })
      .sort((a, b) => (b.name.toLowerCase().startsWith(q) - a.name.toLowerCase().startsWith(q)) || a.name.length - b.name.length);
  }

  /* ---------- toast, modal, confirm ---------- */
  let toastT;
  function toast(msg, kind = '') {
    const t = $('#toast'); t.textContent = msg; t.className = 'toast show ' + kind;
    clearTimeout(toastT); toastT = setTimeout(() => { t.className = 'toast'; }, 2800);
  }
  function modal(html, { cls = '', onClose } = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'mback';
    wrap.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>`;
    $('#modals').appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('in'));
    let closed = false;
    const onKey = e => { if (e.key === 'Escape' && wrap === $('#modals').lastElementChild) close(); };
    function close() {
      if (closed) return; closed = true;
      wrap.classList.remove('in');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => wrap.remove(), 200);
      if (onClose) onClose();
    }
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
    return { el: wrap.firstElementChild, close };
  }
  const mhead = (title, sub) => `<div class="mhead"><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div><button class="iconbtn" data-close aria-label="Tutup">${icon('x')}</button></div>`;
  function confirmBox(title, text, okLabel = 'Ya, lanjut', danger = false) {
    return new Promise(res => {
      let done = false;
      const m = modal(`<div class="confirm"><h3>${title}</h3>${text ? `<p>${text}</p>` : ''}<div class="row2"><button class="btn" data-close>Batal</button><button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${okLabel}</button></div></div>`,
        { cls: 'small', onClose: () => { if (!done) res(false); } });
      m.el.querySelector('[data-ok]').onclick = () => { done = true; res(true); m.close(); };
    });
  }
  const emptyBox = (ic, h, p, cta = '') => `<div class="empty">${icon(ic)}<h3>${h}</h3><p>${p}</p>${cta}</div>`;
  const waLink = (phone, text) => Report.waUrl(phone, text);
  // Foto (gerakan buatan & progres klien) dimuat otomatis tiap ada <img data-photo> baru di layar
  let hyd = 0;
  new MutationObserver(() => { cancelAnimationFrame(hyd); hyd = requestAnimationFrame(() => Photos.hydrate(document)); })
    .observe(document.body, { childList: true, subtree: true });

  /* ---------- state UI ---------- */
  const UI = { filter: 'aktif', q: '', ctab: {}, liftQ: '', lastClient: '' };
  const NAV = [['klien', 'Klien', 'users'], ['program', 'Program', 'list'], ['akun', 'Akun', 'user']];

  /* ---------- router ---------- */
  let KEEP = false;
  let READY = false;
  function route(keep) {
    if (!READY) return;
    KEEP = keep === true;
    const h = (location.hash || '').replace(/^#\/?/, '');
    const [a, b, c] = h.split('/');
    if (!Cloud.user) return a === 'daftar' ? renderSignup() : a === 'lupa' ? renderForgot() : renderLogin();
    if (a === 'reset' || Cloud.recovery) return renderReset();
    if (!PT.S.account || a === 'masuk' || a === 'daftar' || a === 'lupa') { location.replace('#/klien'); return; }
    if (a === 'klien' && b && c === 'sesi') return renderLog(b, null);
    if (a === 'sesi' && b) return renderLog(null, b);
    if (a === 'klien' && b) return renderClient(b);
    if (a === 'program' && b) return renderProgramEdit(b);
    if (a === 'program') return renderPrograms();
    if (a === 'akun') return renderAccount();
    return renderClients();
  }
  const refresh = () => route(true);

  /* ---------- shell & status langganan ---------- */
  function shell(active, inner, opt = {}) {
    const nav = NAV.map(([k, l, i]) => `<a href="#/${k}" class="${active === k ? 'on' : ''}">${icon(i)}<span>${l}</span></a>`).join('');
    const brand = `<a class="brand" href="#/klien"><img src="/app/assets/logo-mark.png" alt="">Bodimentor<b>PT</b></a>`;
    $('#app').innerHTML = `<div class="shell ${opt.focus ? 'focus' : ''}">
      ${opt.focus ? '' : `<header class="topbar">${brand}${subChip()}</header>`}
      <main class="main">${opt.focus ? '' : banner()}<div class="view">${inner}</div></main>
      ${opt.focus ? '' : `<nav class="tabbar">${nav}</nav>`}</div>`;
    if (!KEEP) window.scrollTo(0, 0);
    KEEP = false;
  }
  function subChip() {
    const s = PT.sub(), C = PT.CONFIG;
    if (s.status === 'trial') return `<button class="subchip ${s.daysLeft <= C.remindDays ? 'warn' : ''}" data-act="checkout">${icon('clock')}Trial · ${s.daysLeft > 0 ? s.daysLeft + ' hari' : 'hari ini'}</button>`;
    if (s.status === 'active') return s.daysLeft <= C.bannerDays
      ? `<button class="subchip warn" data-act="checkout">${icon('clock')}Habis ${lagi(s.daysLeft)}</button>`
      : `<a class="subchip pro" href="#/akun">${icon('crown')}Pro</a>`;
    return `<button class="subchip bad" data-act="checkout">${icon('alert')}Habis</button>`;
  }
  function banner() {
    const s = PT.sub(), C = PT.CONFIG, pend = PT.S.account.pending;
    if (pend) return `<div class="banner info">${icon('clock')}<span><b>Menunggu pembayaran ${rp(pend.total)}.</b> Status dicek otomatis.</span><button class="btn sm primary" data-act="checkout">Lihat</button></div>`;
    if (s.status === 'expired') return `<div class="banner bad">${icon('alert')}<span><b>Langganan habis.</b> Data aman — aktifkan lagi buat lanjut catat sesi & kirim laporan.</span><button class="btn sm primary" data-act="checkout">Aktifkan</button></div>`;
    if (s.status === 'trial' && s.daysLeft <= C.remindDays) return `<div class="banner">${icon('clock')}<span><b>${s.daysLeft > 0 ? `Trial tinggal ${s.daysLeft} hari.` : 'Trial berakhir hari ini.'}</b> Pilih paket biar pencatatan gak putus.</span><button class="btn sm primary" data-act="checkout">Pilih paket</button></div>`;
    if (s.status === 'active' && s.daysLeft <= C.bannerDays) return `<div class="banner">${icon('clock')}<span><b>Langganan habis ${lagi(s.daysLeft)}</b> (${PT.fmtTs(s.end)}).</span><button class="btn sm primary" data-act="checkout">Perpanjang</button></div>`;
    return '';
  }

  /* ============================================================
     AKUN: MASUK · DAFTAR · LUPA PASSWORD · PASSWORD BARU
     ============================================================ */
  const eyeBtn = '<button type="button" class="pw-eye" data-eye aria-label="Lihat password">' + '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button>';
  const pwField = (name, label, ac, hint) => `<div class="field"><label>${label}${hint ? ` <small>${hint}</small>` : ''}</label><div class="pw"><input name="${name}" type="password" autocomplete="${ac}" required minlength="8">${eyeBtn}</div></div>`;
  function authShell(card, big) {
    $('#app').innerHTML = `<div class="onb auth ${big ? '' : 'compact'}">
      <div class="onb-hero">
        <a class="onb-home" href="/">${icon('back')}Beranda</a>
        <img class="onb-logo" src="/app/assets/logo-mark.png" alt="Bodimentor">
        <h1>Semua klien kamu,<br><span class="gt">satu aplikasi.</span></h1>
        <p>Catat beban tiap sesi, pantau progres, dan kirim laporan PDF ke WhatsApp klien — dalam hitungan detik.</p>
        <ul class="onb-points">
          <li>${icon('dumbbell')}Beban terakhir tiap klien langsung kelihatan</li>
          <li>${icon('camera')}Foto progres jadi before–after otomatis</li>
          <li>${icon('wa')}Laporan PDF terkirim ke WhatsApp sekali tap</li>
        </ul>
      </div>
      <div class="onb-card">${card}
        ${Cloud.enabled ? '' : `<p class="fine">${icon('shield')} Mode lokal: akun & data tersimpan di perangkat ini saja.</p>`}</div></div>`;
    window.scrollTo(0, 0);
    const f = $('#authForm');
    if (f) { const first = f.querySelector('input'); if (first && matchMedia('(min-width: 700px)').matches) first.focus(); }
  }
  const authErr = m => { const el = $('#authErr'); if (el) el.innerHTML = m ? `<div class="note">${icon('alert')}<p>${esc(m)}</p></div>` : ''; };
  async function busy(btn, label, fn) {
    const old = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spin-sm"></span>${label}`;
    try { return await fn(); } finally { if (document.body.contains(btn)) { btn.disabled = false; btn.innerHTML = old; } }
  }

  function renderLogin(msg) {
    authShell(`<form class="form" id="authForm" novalidate>
        <h2>Masuk ke akun PT</h2>
        <p class="muted small">Belum punya akun? <a class="link" href="#/daftar">Daftar gratis ${PT.CONFIG.trialDays} hari</a></p>
        <div class="field"><label>Email</label><input name="email" type="email" inputmode="email" autocomplete="email" required placeholder="nama@email.com"></div>
        ${pwField('password', 'Password', 'current-password')}
        <div class="auth-row"><a class="link" href="#/lupa">Lupa password?</a></div>
        <div id="authErr">${msg ? `<div class="note plain">${icon('check')}<p>${esc(msg)}</p></div>` : ''}</div>
        <button class="btn primary lg block" type="submit">Masuk</button>
      </form>`);
    $('#authForm').onsubmit = async e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      if (!d.email || !d.password) return authErr('Isi email dan password.');
      authErr('');
      await busy(e.submitter || $('#authForm button[type=submit]'), 'Masuk…', async () => {
        try { const u = await Cloud.signIn(d.email, d.password); await enterApp(u, 'Selamat datang kembali!'); }
        catch (err) { authErr(err.message); }
      });
    };
  }
  function renderSignup() {
    authShell(`<form class="form" id="authForm" novalidate>
        <h2>Buat akun PT</h2>
        <p class="muted small">Trial ${PT.CONFIG.trialDays} hari gratis, tanpa kartu kredit. Sudah punya akun? <a class="link" href="#/masuk">Masuk</a></p>
        <div class="field"><label>Nama kamu</label><input name="name" required autocomplete="name" placeholder="mis. Kimi Mawarid"></div>
        <div class="field"><label>Nama gym / brand <small>opsional</small></label><input name="gym" autocomplete="organization" placeholder="mis. Bodimentor Coaching"></div>
        <div class="field"><label>No. WhatsApp <small>tampil di laporan klien</small></label><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="0812xxxxxxx"></div>
        <div class="field"><label>Email</label><input name="email" type="email" inputmode="email" autocomplete="email" required placeholder="nama@email.com"></div>
        ${pwField('password', 'Buat password', 'new-password', 'minimal 8 karakter')}
        <label class="check"><input type="checkbox" name="demo" checked>Isi contoh klien biar bisa langsung coba</label>
        <div id="authErr"></div>
        <button class="btn primary lg block" type="submit">Buat akun & mulai trial</button>
        <p class="fine">Setelah ${PT.CONFIG.trialDays} hari, lanjut ${rp(PT.CONFIG.plans[0].price)}/bulan. Bisa berhenti kapan aja.</p>
      </form>`, true);
    $('#authForm').onsubmit = async e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const name = String(d.name || '').trim(), email = String(d.email || '').trim();
      if (!name) return authErr('Isi nama kamu.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return authErr('Email belum benar.');
      if (String(d.password || '').length < 8) return authErr('Password minimal 8 karakter.');
      authErr('');
      await busy(e.submitter || $('#authForm button[type=submit]'), 'Membuat akun…', async () => {
        try {
          const meta = { name, gym: String(d.gym || '').trim(), phone: String(d.phone || '').trim(), demo: !!d.demo };
          const r = await Cloud.signUp(email, d.password, meta);
          if (r.needsConfirm) return renderCheckEmail(email);
          await enterApp(r.user, `Trial ${PT.CONFIG.trialDays} hari kamu aktif. Selamat mencoba!`);
        } catch (err) { authErr(err.message); }
      });
    };
  }
  function renderCheckEmail(email) {
    authShell(`<div class="auth-done"><div class="okc">${icon('mail')}</div><h2>Cek email kamu</h2>
      <p class="muted">Kami kirim link konfirmasi ke <b>${esc(email)}</b>. Buka link itu untuk mengaktifkan akun, lalu kamu langsung masuk.</p>
      <p class="muted small">Gak ada di inbox? Cek folder <b>Spam/Promosi</b>.</p>
      <a class="btn block lg" href="#/masuk">Sudah konfirmasi? Masuk</a></div>`);
  }
  function renderForgot() {
    authShell(`<form class="form" id="authForm" novalidate>
        <h2>Lupa password</h2>
        <p class="muted small">Masukkan email akun kamu. Kami kirim link untuk membuat password baru.</p>
        <div class="field"><label>Email</label><input name="email" type="email" inputmode="email" autocomplete="email" required placeholder="nama@email.com"></div>
        <div id="authErr"></div>
        <button class="btn primary lg block" type="submit">Kirim link reset</button>
        <p class="fine"><a class="link" href="#/masuk">Kembali ke halaman masuk</a></p>
      </form>`);
    $('#authForm').onsubmit = async e => {
      e.preventDefault();
      const email = String(new FormData(e.target).get('email') || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return authErr('Email belum benar.');
      authErr('');
      await busy(e.submitter || $('#authForm button[type=submit]'), 'Mengirim…', async () => {
        try {
          await Cloud.requestReset(email);
          authShell(`<div class="auth-done"><div class="okc">${icon('mail')}</div><h2>Link sudah dikirim</h2>
            <p class="muted">Kalau <b>${esc(email)}</b> terdaftar, link reset password sudah masuk ke email itu. Buka linknya, lalu buat password baru.</p>
            <p class="muted small">Link berlaku 1 jam. Cek juga folder <b>Spam/Promosi</b>.</p>
            <a class="btn block lg" href="#/masuk">Kembali ke halaman masuk</a></div>`);
        } catch (err) { authErr(err.message); }
      });
    };
  }
  function renderReset() {
    authShell(`<form class="form" id="authForm" novalidate>
        <h2>Buat password baru</h2>
        <p class="muted small">Untuk akun <b>${esc(Cloud.user ? Cloud.user.email : '')}</b>.</p>
        ${pwField('password', 'Password baru', 'new-password', 'minimal 8 karakter')}
        ${pwField('password2', 'Ulangi password baru', 'new-password')}
        <div id="authErr"></div>
        <button class="btn primary lg block" type="submit">Simpan password baru</button>
      </form>`);
    $('#authForm').onsubmit = async e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      if (String(d.password || '').length < 8) return authErr('Password minimal 8 karakter.');
      if (d.password !== d.password2) return authErr('Kedua password belum sama.');
      authErr('');
      await busy(e.submitter || $('#authForm button[type=submit]'), 'Menyimpan…', async () => {
        try { await Cloud.setPassword(d.password); await enterApp(Cloud.user, 'Password baru tersimpan'); }
        catch (err) { authErr(err.message); }
      });
    };
  }

  /* ---------- buka data akun + sinkron server ---------- */
  let pushT = 0, pushing = false, dirty = false;
  function pushSoon(ms = 1500) { dirty = true; clearTimeout(pushT); pushT = setTimeout(pushNow, ms); }
  async function pushNow() {
    clearTimeout(pushT);
    if (!Cloud.enabled || !Cloud.user || pushing || !dirty) return;
    pushing = true; dirty = false;
    try { await Cloud.saveDoc(PT.S); }
    catch (e) { dirty = true; console.warn('sinkron ditunda:', e.message); }
    finally { pushing = false; if (dirty) pushT = setTimeout(pushNow, 8000); }
  }
  function applySub(s) {
    if (!s || !PT.S.account) return;
    const a = PT.S.account;
    if (s.trialEnd) a.trialEnd = s.trialEnd;
    a.paidUntil = s.paidUntil || 0;
  }
  async function syncServer() {
    if (!Cloud.enabled || !Cloud.user) return;
    try {
      applySub(await Cloud.getSub());
      const pays = await Cloud.payments();
      const inv = PT.S.invoices;
      pays.forEach(p => { if (!inv.some(i => i.id === p.order_id)) inv.push({ id: p.order_id, date: new Date(p.created_at).getTime(), planName: 'Bulanan', amount: Number(p.amount), method: methodLabel(p.method), start: new Date(p.period_start).getTime(), end: new Date(p.period_end).getTime(), status: 'Lunas' }); });
      inv.sort((x, y) => y.date - x.date);
      PT.save();
    } catch (e) { console.warn('status langganan belum bisa dicek:', e.message); }
  }
  async function openAccount(user) {
    PT.onSave(null);
    PT.bind(user.id);
    if (Cloud.enabled) {
      try {
        const r = await Cloud.loadDoc();
        const remoteAt = r ? new Date(r.updated_at).getTime() : 0;
        if (r && r.data && r.data.v === 1 && remoteAt >= (PT.S.updatedAt || 0) - 1000) PT.replace(r.data);
        else if (PT.S.account) dirty = true;   // data di HP lebih baru / server masih kosong → kirim
      } catch (e) { toast('Sedang offline — pakai data di perangkat ini', 'err'); }
    }
    if (!PT.S.account) {
      const m = user.user_metadata || {};
      PT.createAccount({ name: m.name || user.email.split('@')[0], gym: m.gym || '', phone: m.phone || '', email: user.email });
      PTSeed.programs();
      if (m.demo) PTSeed.demo();
      dirty = true;
    }
    PT.S.account.email = user.email;
    if (Cloud.enabled) {
      PT.onSave(() => pushSoon());
      await syncServer();
      if (dirty) pushNow();
      Cloud.flushPhotos();
    }
  }
  async function enterApp(user, msg) {
    await openAccount(user);
    if (location.hash === '#/klien') route(); else location.hash = '#/klien';
    if (msg) toast(msg);
    setTimeout(() => { watchPending(); checkReminder(); }, 800);
  }

  /* ============================================================
     KLIEN — daftar
     ============================================================ */
  function renderClients() {
    const S = PT.S;
    const rows = S.clients.filter(c => c.active).map(c => ({ c, st: PT.status(c) }));
    const ids = new Set(rows.map(x => x.c.id));
    const wk = PT.addDays(PT.today(), -6);
    const weekSess = S.sessions.filter(s => s.date >= wk && ids.has(s.clientId)).length;
    const att = rows.filter(x => x.st.follow || x.st.pkgLow)
      .sort((a, b) => (b.st.pkgLow - a.st.pkgLow) || ((b.st.since || 99) - (a.st.since || 99)));
    shell('klien', `
      <div class="phead"><div><p class="eyebrow">Halo, Coach ${esc(firstName(S.account.name))}</p><h1>Klien kamu</h1></div>
        <button class="btn primary sm" data-act="client-new">${icon('plus')}<span>Klien</span></button></div>
      <div class="stats">
        <div class="stat"><b>${rows.length}</b><span>Klien aktif</span></div>
        <div class="stat"><b>${weekSess}</b><span>Sesi 7 hari terakhir</span></div>
        <div class="stat ${att.length ? 'warn' : ''}"><b>${att.length}</b><span>Perlu perhatian</span></div>
      </div>
      ${att.length ? attentionCard(att) : ''}
      ${S.clients.length ? `<div class="listbar">
        <label class="search">${icon('search')}<input id="cq" type="search" placeholder="Cari nama klien…" value="${esc(UI.q)}" autocomplete="off"></label>
        <div class="chips" id="cfilter">${[['aktif', 'Aktif'], ['semua', 'Semua'], ['nonaktif', 'Nonaktif']].map(([k, l]) => `<button class="chip ${UI.filter === k ? 'on' : ''}" data-filter="${k}">${l}</button>`).join('')}</div>
      </div>` : ''}
      <div id="clist" class="clist"></div>`);
    paintClientList();
  }
  function attentionCard(att) {
    return `<section class="card attn"><div class="attn-h">${icon('alert')}<b>Perlu perhatian</b><span class="muted">${att.length} klien</span></div>
      ${att.slice(0, 5).map(({ c, st }) => {
        const why = st.pkgLow ? (st.pkgLeft <= 0 ? 'Paket sesi sudah habis' : `Paket tinggal ${st.pkgLeft} sesi`) : st.since === null ? 'Belum ada sesi tercatat' : `${st.since} hari belum latihan`;
        const msg = st.pkgLow
          ? `Halo ${firstName(c.name)}! Paket latihan kamu ${st.pkgLeft <= 0 ? 'sudah habis' : `tinggal ${st.pkgLeft} sesi lagi`} nih. Mau lanjut perpanjang biar progresnya gak putus? 💪`
          : `Halo ${firstName(c.name)}! Udah ${st.since || 'beberapa'} hari nih kita belum latihan. Minggu ini bisa jadwalin sesi kapan? 💪`;
        return `<div class="attn-row"><a href="#/klien/${c.id}" class="attn-who">${avatar(c, 'sm')}<span><b>${esc(c.name)}</b><small class="${st.pkgLow ? 'amber' : 'rose'}">${why}</small></span></a>
          ${c.phone ? `<a class="btn sm wa" href="${waLink(c.phone, msg)}" target="_blank" rel="noopener">${icon('wa')}Chat</a>` : ''}</div>`;
      }).join('')}</section>`;
  }
  function topLift(sess) {
    let top = null;
    sess.exercises.forEach(e => { const b = PT.best(e.sets); if (b && (!top || b[0] > top.best[0])) top = { name: e.name, best: b }; });
    return top;
  }
  function paintClientList() {
    const el = $('#clist'); if (!el) return;
    const S = PT.S;
    if (!S.clients.length) {
      el.innerHTML = emptyBox('users', 'Belum ada klien', 'Tambah klien pertama kamu — cukup nama & nomor WhatsApp.', `<button class="btn primary" data-act="client-new">${icon('plus')}Tambah klien</button>`);
      return;
    }
    const q = UI.q.trim().toLowerCase();
    let rows = S.clients.map(c => ({ c, st: PT.status(c) }));
    if (UI.filter === 'aktif') rows = rows.filter(x => x.c.active);
    if (UI.filter === 'nonaktif') rows = rows.filter(x => !x.c.active);
    if (q) rows = rows.filter(x => x.c.name.toLowerCase().includes(q));
    rows.sort((a, b) => (b.st.last ? b.st.last.date : '').localeCompare(a.st.last ? a.st.last.date : '') || a.c.name.localeCompare(b.c.name));
    el.innerHTML = rows.length ? rows.map(({ c, st }) => clientCard(c, st)).join('') : `<div class="empty sm">Gak ada klien yang cocok.</div>`;
  }
  function clientCard(c, st) {
    const prog = PT.program(c.programId), age = PT.age(c);
    const tl = st.last ? topLift(st.last) : null;
    const dot = !c.active ? 'off' : st.follow ? 'rose' : '';
    return `<a class="ccard" href="#/klien/${c.id}">
      ${avatar(c)}
      <div class="cc-main">
        <div class="cc-top"><b>${esc(c.name)}</b>${c.goal ? `<span class="pill">${esc(c.goal)}</span>` : ''}</div>
        <div class="cc-sub">${[age ? age + ' th' : '', c.type, prog ? prog.name : 'Belum ada program'].filter(Boolean).map(esc).join(' · ')}</div>
        <div class="cc-meta"><span class="dot ${dot}"></span>${st.last ? `Latihan ${PT.ago(st.last.date)}` : 'Belum ada sesi'}${tl ? `<span class="sep">·</span><span class="lift">${esc(shortName(tl.name))} <b>${setTxt(tl.best)}</b></span>` : ''}${st.pkgLeft !== null ? `<span class="sep">·</span><span class="${st.pkgLow ? 'amber' : ''}">Paket sisa ${Math.max(0, st.pkgLeft)}</span>` : ''}</div>
      </div>
      ${icon('chev', 'chev')}
    </a>`;
  }

  /* ============================================================
     KLIEN — detail
     ============================================================ */
  function renderClient(id) {
    const c = PT.client(id);
    if (!c) { location.replace('#/klien'); return; }
    if (UI.lastClient !== id) { UI.liftQ = ''; UI.lastClient = id; }
    const st = PT.status(c), age = PT.age(c);
    const mk = PT.monthKey(PT.today()), cur = PT.monthStats(id, mk), prev = PT.prevStats(id, mk);
    const ms = PT.measuresOf(id), lastM = ms[ms.length - 1];
    const tab = UI.ctab[id] || 'ringkas';
    const dS = cur.sessions - prev.sessions;
    const dW = lastM && ms.length > 1 ? lastM.weight - ms[0].weight : null;
    const wd = weightDir(c.goal);
    const cls = (v, dir = 1) => !v || !dir ? '' : v * dir > 0 ? 'up' : 'down';
    const dr = PT.S.draft;
    const hasDraft = dr && dr.clientId === id && !dr.id && dr.exercises.some(e => e.rows.some(r => r.done));
    const gender = c.gender === 'P' ? 'Perempuan' : c.gender === 'L' ? 'Laki-laki' : '';
    shell('klien', `
      <div class="crumb"><a href="#/klien" class="iconbtn" aria-label="Kembali">${icon('back')}</a><span>Klien</span></div>
      <section class="chero card">
        <div class="chero-top">
          ${avatar(c, 'lg')}
          <div class="chero-id">
            <h1>${esc(c.name)}</h1>
            <p>${[age ? age + ' tahun' : '', gender, c.heightCm ? c.heightCm + ' cm' : ''].filter(Boolean).join(' · ') || 'Lengkapi data klien'}</p>
          </div>
          <button class="iconbtn" data-act="client-edit" data-id="${id}" aria-label="Edit klien">${icon('edit')}</button>
        </div>
        <div class="tags">${[c.goal, c.type, c.level].filter(Boolean).map(t => `<span class="pill">${esc(t)}</span>`).join('')}${!c.active ? '<span class="pill off">Nonaktif</span>' : ''}</div>
        ${hasDraft ? `<div class="draftbar">${icon('clock')}<span>Ada sesi yang belum disimpan.</span><a class="btn sm primary" href="#/klien/${id}/sesi" data-guard>Lanjutkan</a></div>` : ''}
        <div class="chero-actions">
          <a class="btn primary lg span2" href="#/klien/${id}/sesi" data-guard>${icon('plus')}Catat sesi</a>
          <button class="btn soft" data-act="report" data-id="${id}">${icon('file')}Laporan PDF</button>
          ${c.phone ? `<a class="btn wa" href="${waLink(c.phone, '')}" target="_blank" rel="noopener">${icon('wa')}Chat WA</a>`
            : `<button class="btn" data-act="client-edit" data-id="${id}">${icon('edit')}Edit data</button>`}
        </div>
      </section>
      <div class="kpis">
        <div class="kpi"><small>Sesi bulan ini</small><b>${cur.sessions}</b><span class="${cls(dS)}" title="Dibanding periode yang sama bulan lalu">${dS > 0 ? '+' : ''}${dS} vs ${PT.vsLabel(mk)}</span></div>
        <div class="kpi"><small>Berat terakhir</small><b>${lastM ? f1(lastM.weight) + ' kg' : '—'}</b><span class="${cls(dW, wd)}">${dW != null ? `${dW > 0 ? '+' : ''}${f1(dW)} kg sejak mulai` : 'belum ada pembanding'}</span></div>
        <div class="kpi"><small>Terakhir latihan</small><b>${st.last ? PT.ago(st.last.date) : '—'}</b><span>${st.last ? PT.fmtDate(st.last.date) : 'belum ada sesi'}</span></div>
        <div class="kpi"><small>${st.pkgLeft !== null ? 'Sisa paket' : 'Total sesi'}</small><b class="${st.pkgLow ? 'amber' : ''}">${st.pkgLeft !== null ? Math.max(0, st.pkgLeft) + ' sesi' : st.count}</b><span>${st.pkgLeft !== null ? `dari ${c.pkgTotal} sesi` : 'sejak mulai'}</span></div>
      </div>
      <div class="seg" id="ctabs">${[['ringkas', 'Ringkasan'], ['beban', 'Beban'], ['riwayat', 'Riwayat'], ['tubuh', 'Tubuh']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-ctab="${k}" data-id="${id}">${l}</button>`).join('')}</div>
      <div id="ctab"></div>`);
    paintCTab(c);
  }
  function paintCTab(c) {
    const tab = UI.ctab[c.id] || 'ringkas';
    $('#ctab').innerHTML = tab === 'beban' ? tabLifts(c) : tab === 'riwayat' ? tabHistory(c) : tab === 'tubuh' ? tabBody(c) : tabSummary(c);
  }
  function tabSummary(c) {
    const prog = PT.program(c.programId), st = PT.status(c), age = PT.age(c);
    const nd = prog ? PT.nextDay(c.id, prog) : null;
    const lifts = PT.lifts(c.id).slice(0, 6);
    const kv = (l, v) => `<div><small>${l}</small><b>${v}</b></div>`;
    return `<div class="grid2">
      <section class="card">
        <div class="sec-h"><h3>Program aktif</h3><button class="btn sm ghost" data-act="client-edit" data-id="${c.id}">Ganti</button></div>
        ${prog ? `<p class="prog-name">${esc(prog.name)}</p>${prog.desc ? `<p class="muted small">${esc(prog.desc)}</p>` : ''}
          <div class="daychips">${prog.days.map(d => `<span class="daychip ${nd && nd.id === d.id ? 'next' : ''}">${esc(d.name)}${nd && nd.id === d.id ? ' · berikutnya' : ''}</span>`).join('')}</div>`
        : `<p class="muted small">Belum pakai program. <a class="link" data-act="client-edit" data-id="${c.id}">Pilih program</a> biar gerakan & target set langsung keisi saat catat sesi.</p>`}
      </section>
      <section class="card">
        <div class="sec-h"><h3>Beban terakhir</h3>${lifts.length ? `<button class="btn sm ghost" data-ctab="beban" data-id="${c.id}">Lihat semua</button>` : ''}</div>
        ${lifts.length ? `<div class="lrows">${lifts.map(L => liftRow(c, L)).join('')}</div>` : `<p class="muted small">Belum ada data beban. Catat sesi pertama dulu.</p>`}
      </section>
    </div>
    <section class="card">
      <div class="sec-h"><h3>Detail klien</h3><button class="btn sm ghost" data-act="client-edit" data-id="${c.id}">${icon('edit')}Edit</button></div>
      <div class="kv">
        ${kv('WhatsApp', c.phone ? esc(c.phone) : '—')}${kv('Umur', age ? age + ' tahun' : '—')}
        ${kv('Jenis kelamin', c.gender === 'P' ? 'Perempuan' : c.gender === 'L' ? 'Laki-laki' : '—')}${kv('Tinggi badan', c.heightCm ? c.heightCm + ' cm' : '—')}
        ${kv('Tujuan', esc(c.goal || '—'))}${kv('Jenis latihan', esc(c.type || '—'))}
        ${kv('Level', esc(c.level || '—'))}${kv('Target latihan', c.perWeek ? c.perWeek + '× / minggu' : '—')}
        ${kv('Mulai latihan', c.startDate ? PT.fmtDate(c.startDate) : '—')}${kv('Paket sesi', c.pkgTotal ? `${Math.max(0, st.pkgLeft)} dari ${c.pkgTotal} tersisa` : '—')}
      </div>
      ${c.notes ? `<div class="note">${icon('alert')}<p>${esc(c.notes)}</p></div>` : ''}
    </section>`;
  }
  function liftRow(c, L) {
    const bw = !L.last.best[0];
    const d = bw ? L.last.best[1] - L.first.best[1] : L.last.best[0] - L.first.best[0];
    const sub = d ? `<small class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : ''}${bw ? d + ' reps' : f1(d) + ' kg'}</small>` : `<small>PR ${setTxt(L.pr.best)}</small>`;
    return `<button class="lrow" data-act="lift" data-id="${c.id}" data-name="${esc(L.name)}">${thumb(L.name)}
      <span class="lrow-main"><b>${esc(L.name)}</b><small>${PT.fmtDate(L.last.date, false)} · ${L.count}× dilatih</small></span>
      <span class="lrow-val"><b>${setTxt(L.last.best)}</b>${sub}</span></button>`;
  }
  function tabLifts(c) {
    const all = PT.lifts(c.id);
    if (!all.length) return emptyBox('dumbbell', 'Belum ada data beban', 'Beban tiap gerakan muncul otomatis setelah kamu catat sesi.', `<a class="btn primary" href="#/klien/${c.id}/sesi" data-guard>${icon('plus')}Catat sesi</a>`);
    return `<label class="search">${icon('search')}<input id="lq" type="search" placeholder="Cari gerakan…" value="${esc(UI.liftQ)}" data-cid="${c.id}" autocomplete="off"></label>
      <section class="card"><div class="sec-h"><h3>${all.length} gerakan</h3><span class="muted small">beban terakhir · perubahan sejak awal</span></div><div class="lrows" id="llist">${liftList(c, all)}</div></section>`;
  }
  function liftList(c, all) {
    const q = UI.liftQ.trim().toLowerCase();
    const list = q ? all.filter(L => L.name.toLowerCase().includes(q)) : all;
    return list.map(L => liftRow(c, L)).join('') || '<p class="muted small">Gak ada gerakan yang cocok.</p>';
  }
  function tabHistory(c) {
    const ss = PT.sessionsOf(c.id);
    if (!ss.length) return emptyBox('cal', 'Belum ada sesi', 'Riwayat latihan klien muncul di sini.', `<a class="btn primary" href="#/klien/${c.id}/sesi" data-guard>${icon('plus')}Catat sesi</a>`);
    const groups = {};
    ss.forEach(s => (groups[PT.monthKey(s.date)] = groups[PT.monthKey(s.date)] || []).push(s));
    return Object.keys(groups).map(k => {
      const arr = groups[k];
      return `<div class="hgroup"><div class="hgroup-h"><b>${PT.monthLabel(k, true)}</b><span>${arr.length} sesi · ${fmt(arr.reduce((t, s) => t + PT.volume(s), 0))} kg</span></div>
        ${arr.map(s => `<button class="hrow" data-act="session" data-id="${s.id}">
          <span class="hdate"><b>${PT.parse(s.date).getDate()}</b><small>${DOW[PT.parse(s.date).getDay()]}</small></span>
          <span class="hmain"><b>${esc(s.dayName || 'Sesi bebas')}</b><small>${s.exercises.length} gerakan · ${PT.setCount(s)} set · ${fmt(PT.volume(s))} kg</small></span>
          ${icon('chev', 'chev')}</button>`).join('')}</div>`;
    }).join('');
  }
  function tabBody(c) {
    const ms = PT.measuresOf(c.id);
    const cell = (v, p, unit, dir) => {
      if (v == null) return '—';
      const d = p != null ? v - p : 0;
      return `${f1(v)}${unit}${d ? `<small class="${!dir ? 'muted' : d * dir > 0 ? 'up' : 'down'}">${d > 0 ? '+' : ''}${f1(d)}</small>` : ''}`;
    };
    const wd = weightDir(c.goal);
    const rows = ms.slice().reverse();
    return `${progressCard(c)}<section class="card">
      <div class="sec-h"><h3>Berat badan</h3><button class="btn sm primary" data-act="measure-new" data-id="${c.id}">${icon('plus')}Ukur</button></div>
      ${ms.length >= 2 ? lineChart(ms.map(m => ({ x: PT.parse(m.date).getTime(), y: m.weight, label: PT.fmtDate(m.date, false) })))
        : `<p class="muted small">${ms.length ? 'Tambah 1 pengukuran lagi buat lihat grafik.' : 'Belum ada data. Catat berat & ukuran badan klien secara rutin (mis. tiap 2 minggu).'}</p>`}
    </section>
    ${ms.length ? `<section class="card"><div class="sec-h"><h3>Riwayat pengukuran</h3></div>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Tanggal</th><th>Berat</th><th>Body fat</th><th>Pinggang</th><th>Lengan</th><th>Paha</th><th></th></tr></thead><tbody>
      ${rows.map((m, i) => { const p = rows[i + 1] || {}; return `<tr><td>${PT.fmtDate(m.date)}</td>
        <td>${cell(m.weight, p.weight, ' kg', wd)}</td><td>${cell(m.bodyFat, p.bodyFat, '%', -1)}</td><td>${cell(m.waist, p.waist, ' cm', wd === 1 ? 0 : -1)}</td>
        <td>${cell(m.arm, p.arm, ' cm', 0)}</td><td>${cell(m.thigh, p.thigh, ' cm', 0)}</td>
        <td><button class="iconbtn xs" data-act="measure-del" data-id="${m.id}" aria-label="Hapus">${icon('trash')}</button></td></tr>`; }).join('')}
      </tbody></table></div></section>` : ''}`;
  }
  const poseLabel = p => (POSES.find(x => x[0] === p) || [0, 'Foto'])[1];
  const beforeAfter = (cid, upto) => PT.beforeAfter(cid, upto);
  const weightOn = (cid, date) => { const ms = PT.measuresOf(cid).filter(m => m.date <= date); return ms.length ? ms[ms.length - 1].weight : null; };
  function progressCard(c) {
    const all = PT.photosOf(c.id);
    if (!all.length) return `<section class="card"><div class="sec-h"><h3>Foto progres</h3></div>
      <p class="muted small">Belum ada foto. Ambil foto klien di akhir sesi (layar <b>Catat sesi</b> → Foto progres klien). Foto pertama & terbaru otomatis jadi before–after di laporan PDF.</p></section>`;
    const ba = beforeAfter(c.id);
    const side = (p, label) => { const w = weightOn(c.id, p.date); return `<button type="button" class="ba-side" data-act="photo-view" data-id="${esc(p.id)}" data-cid="${c.id}"><img data-photo="${esc(p.id)}" alt=""><span class="ba-tag">${label}</span><small>${PT.fmtDate(p.date)}${w != null ? ' · ' + f1(w) + ' kg' : ''}</small></button>`; };
    const byDate = {}; all.slice().reverse().forEach(p => (byDate[p.date] = byDate[p.date] || []).push(p));
    return `<section class="card">
      <div class="sec-h"><h3>Foto progres</h3><span class="muted small">${all.length} foto</span></div>
      ${ba ? `<div class="ba">${side(ba.before, 'Before')}${side(ba.after, 'After')}</div>` : '<p class="muted small" style="margin-bottom:10px">Before–after muncul setelah ada foto di 2 tanggal berbeda.</p>'}
      ${Object.keys(byDate).map(d => `<div class="pday-ph"><small>${PT.fmtDate(d)}</small><div class="pgrid">${byDate[d].map(p => `<button type="button" class="pcell" data-act="photo-view" data-id="${esc(p.id)}" data-cid="${c.id}"><img data-photo="${esc(p.id)}" alt=""><span>${esc(poseLabel(p.pose))}</span></button>`).join('')}</div></div>`).join('')}
    </section>`;
  }
  function openPhoto(cid, id) {
    const p = PT.photosOf(cid).find(x => x.id === id); if (!p) return;
    const w = weightOn(cid, p.date);
    modal(`${mhead(esc(poseLabel(p.pose)), `${PT.fmtDateLong(p.date)}${w != null ? ' · ' + f1(w) + ' kg' : ''}`)}
      <div class="mbody"><div class="ph-view"><img data-photo="${esc(id)}" alt=""></div></div>
      <div class="mfoot"><a class="btn" href="#/sesi/${p.sessionId}" data-guard data-close>${icon('edit')}Buka sesi</a></div>`, { cls: 'wide' });
  }
  function lineChart(pts) {
    const W = 360, H = 150, P = { l: 36, r: 10, t: 12, b: 22 };
    const ys = pts.map(p => p.y);
    let lo = Math.min(...ys), hi = Math.max(...ys); const pad = (hi - lo) * 0.2 || 1; lo -= pad; hi += pad;
    const x0 = pts[0].x, x1 = pts[pts.length - 1].x;
    const X = x => P.l + (x - x0) / ((x1 - x0) || 1) * (W - P.l - P.r);
    const Y = y => P.t + (1 - (y - lo) / (hi - lo)) * (H - P.t - P.b);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + X(p.x).toFixed(1) + ',' + Y(p.y).toFixed(1)).join(' ');
    const id = 'lg' + Math.random().toString(36).slice(2, 7);
    const grid = [0, 0.5, 1].map(f => { const v = lo + (hi - lo) * f, yy = Y(v).toFixed(1); return `<line class="gl" x1="${P.l}" x2="${W - P.r}" y1="${yy}" y2="${yy}"/><text class="gx" x="${P.l - 6}" y="${(+yy + 3.5).toFixed(1)}" text-anchor="end">${f1(v)}</text>`; }).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik progres">
      <defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${P.l}" y1="0" x2="${W - P.r}" y2="0"><stop offset="0" stop-color="#2DB4DF"/><stop offset="1" stop-color="#6EC827"/></linearGradient>
      <linearGradient id="${id}a" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#30A19F" stop-opacity=".28"/><stop offset="1" stop-color="#30A19F" stop-opacity="0"/></linearGradient></defs>
      ${grid}
      <path d="${d} L${X(x1).toFixed(1)},${H - P.b} L${X(x0).toFixed(1)},${H - P.b} Z" fill="url(#${id}a)"/>
      <path d="${d}" fill="none" stroke="url(#${id})" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
      ${pts.map(p => `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.6" fill="#6EC827"/>`).join('')}
      <text class="gx" x="${P.l}" y="${H - 5}">${esc(pts[0].label)}</text><text class="gx" x="${W - P.r}" y="${H - 5}" text-anchor="end">${esc(pts[pts.length - 1].label)}</text>
    </svg>`;
  }

  /* ---------- modal: riwayat 1 gerakan ---------- */
  function openLift(cid, name) {
    const L = PT.lifts(cid).find(x => x.name === name); if (!L) return;
    const bw = !L.last.best[0];
    const pts = L.history.map(h => ({ x: PT.parse(h.date).getTime(), y: bw ? h.best[1] : h.best[0], label: PT.fmtDate(h.date, false) }));
    modal(`${mhead(esc(name), `${L.count}× dilatih · sejak ${PT.fmtDate(L.first.date)}`)}
      <div class="mbody">
        ${exNotes(name)}
        <div class="lift-kpis"><div><small>Terakhir</small><b>${setTxt(L.last.best)}</b></div><div><small>Rekor (PR)</small><b>${setTxt(L.pr.best)}</b></div><div><small>Awal</small><b>${setTxt(L.first.best)}</b></div></div>
        ${pts.length > 1 ? `<div><p class="sub-h">${bw ? 'Reps terbanyak' : 'Set terberat (kg)'} per sesi</p>${lineChart(pts)}</div>` : ''}
        <div><p class="sub-h">Riwayat set</p>${L.history.slice().reverse().map(h => `<div class="lh"><span>${PT.fmtDate(h.date)}</span><span>${h.sets.map(x => x[0] ? `${f1(x[0])}×${x[1]}` : `BW×${x[1]}`).join(' · ')}</span></div>`).join('')}</div>
      </div>`, { cls: 'wide' });
  }

  /* ---------- modal: detail sesi ---------- */
  function openSession(id) {
    const s = PT.S.sessions.find(x => x.id === id); if (!s) return;
    const c = PT.client(s.clientId);
    const m = modal(`${mhead(esc(s.dayName || 'Sesi bebas'), `${esc(c ? c.name : '')} · ${PT.fmtDateLong(s.date)}`)}
      <div class="mbody">
        <div class="sess-sum"><span><b>${s.exercises.length}</b>gerakan</span><span><b>${PT.setCount(s)}</b>set</span><span><b>${fmt(PT.volume(s))}</b>kg volume</span></div>
        <div>${s.exercises.map(e => `<div class="sv-ex">${thumb(e.name, 'sm')}<div><b>${esc(e.name)}</b><div class="sv-sets">${e.sets.map((x, i) => `<span>${i + 1}. ${x[0] ? f1(x[0]) + ' kg' : 'BW'} × ${x[1]}</span>`).join('')}</div></div></div>`).join('')}</div>
        ${s.notes ? `<div class="note plain">${icon('file')}<p>${esc(s.notes)}</p></div>` : ''}
        ${s.photos && s.photos.length ? `<div><p class="sub-h" style="margin-bottom:8px">Foto progres</p><div class="pgrid">${s.photos.map(p => `<button type="button" class="pcell" data-act="photo-view" data-id="${esc(p.id)}" data-cid="${s.clientId}"><img data-photo="${esc(p.id)}" alt=""><span>${esc(poseLabel(p.pose))}</span></button>`).join('')}</div></div>` : ''}
      </div>
      <div class="mfoot"><button class="btn danger" data-del aria-label="Hapus sesi">${icon('trash')}</button><a class="btn primary" href="#/sesi/${s.id}" data-guard data-close>${icon('edit')}Edit sesi</a></div>`);
    m.el.querySelector('[data-del]').onclick = async () => {
      if (!(await confirmBox('Hapus sesi ini?', 'Semua set di sesi ini hilang permanen.', 'Hapus', true))) return;
      PT.sessionPhotoIds(id).forEach(pid => Photos.remove(pid));
      PT.removeSession(id); m.close(); refresh(); toast('Sesi dihapus');
    };
  }

  /* ---------- form klien ---------- */
  const pick = (name, opts, val) => `<div class="pick" data-pick="${name}"><input type="hidden" name="${name}" value="${esc(val || '')}">${opts.map(o => `<button type="button" class="chip ${o[0] === val ? 'on' : ''}" data-v="${esc(o[0])}">${esc(o[1])}</button>`).join('')}</div>`;
  function openClientForm(id) {
    const c = id ? PT.client(id) : null, C = PT.CONFIG;
    const v = c || { gender: 'L', perWeek: 3, startDate: PT.today(), type: C.types[0], level: C.levels[0] };
    const st = c ? PT.status(c) : null;
    const m = modal(`${mhead(c ? 'Edit klien' : 'Klien baru', c ? esc(c.name) : 'Isi yang penting dulu — sisanya bisa dilengkapi nanti.')}
      <form class="mbody form" id="cform" autocomplete="off">
        <div class="field"><label>Nama lengkap *</label><input name="name" required value="${esc(v.name || '')}" placeholder="mis. Andi Pratama"></div>
        <div class="field"><label>No. WhatsApp <small>buat kirim laporan</small></label><input name="phone" type="tel" inputmode="tel" value="${esc(v.phone || '')}" placeholder="0812xxxxxxx"></div>
        <div class="field"><label>Jenis kelamin</label>${pick('gender', [['L', 'Laki-laki'], ['P', 'Perempuan']], v.gender)}</div>
        <div class="row3">
          <div class="field"><label>Umur</label><input name="age" type="number" inputmode="numeric" min="5" max="99" value="${c && PT.age(c) ? PT.age(c) : ''}" placeholder="tahun"></div>
          <div class="field"><label>Tinggi</label><input name="heightCm" type="number" inputmode="numeric" value="${v.heightCm || ''}" placeholder="cm"></div>
          ${c ? `<div class="field"><label>Target</label><select name="perWeek">${[1, 2, 3, 4, 5, 6, 7].map(n => `<option value="${n}" ${+v.perWeek === n ? 'selected' : ''}>${n}×/mgg</option>`).join('')}</select></div>`
            : '<div class="field"><label>Berat</label><input name="weight" type="text" inputmode="decimal" placeholder="kg"></div>'}
        </div>
        <div class="field"><label>Tujuan latihan</label>${pick('goal', C.goals.map(g => [g, g]), v.goal)}</div>
        <div class="field"><label>Jenis latihan</label>${pick('type', C.types.map(g => [g, g]), v.type)}</div>
        <div class="row2">
          <div class="field"><label>Level</label><select name="level">${C.levels.map(l => `<option ${v.level === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          ${c ? `<div class="field"><label>Mulai latihan</label><input name="startDate" type="date" value="${v.startDate || ''}"></div>`
            : `<div class="field"><label>Target latihan</label><select name="perWeek">${[1, 2, 3, 4, 5, 6, 7].map(n => `<option value="${n}" ${+v.perWeek === n ? 'selected' : ''}>${n}× / minggu</option>`).join('')}</select></div>`}
        </div>
        <div class="field"><label>Program latihan</label><select name="programId"><option value="">— Belum pakai program —</option>${PT.S.programs.map(p => `<option value="${p.id}" ${v.programId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Paket sesi <small>${c && c.pkgTotal ? `sisa ${Math.max(0, st.pkgLeft)} · ganti angka = paket baru mulai hari ini` : 'opsional, mis. 12 sesi'}</small></label><input name="pkgTotal" type="number" inputmode="numeric" min="0" value="${v.pkgTotal || ''}" placeholder="jumlah sesi"></div>
        <div class="field"><label>Catatan <small>cedera, kondisi kesehatan, preferensi</small></label><textarea name="notes" rows="3" placeholder="mis. Lutut kiri pernah cedera, hindari lompat">${esc(v.notes || '')}</textarea></div>
        ${c ? `<label class="switch"><input type="checkbox" name="active" ${c.active ? 'checked' : ''}><span></span>Klien aktif</label>` : ''}
      </form>
      <div class="mfoot">${c ? `<button class="btn danger" data-del aria-label="Hapus klien">${icon('trash')}</button>` : ''}<button class="btn" data-close>Batal</button><button class="btn primary" type="submit" form="cform">${c ? 'Simpan' : 'Tambah klien'}</button></div>`, { cls: 'tall' });
    const f = $('#cform', m.el);
    f.onsubmit = e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      const name = String(d.name || '').trim(); if (!name) return;
      const data = {
        name, phone: String(d.phone || '').trim(), gender: d.gender, birthYear: +d.age ? new Date().getFullYear() - +d.age : null,
        heightCm: +d.heightCm || null, goal: d.goal, type: d.type, level: d.level, perWeek: +d.perWeek || null,
        programId: d.programId, notes: String(d.notes || '').trim(),
      };
      const pkg = parseInt(d.pkgTotal, 10) || 0;
      if (c) {
        if (d.startDate) data.startDate = d.startDate;
        if (pkg !== (c.pkgTotal || 0)) { data.pkgTotal = pkg || null; data.pkgStart = pkg ? PT.today() : null; }
        data.active = !!f.elements.active.checked;
        PT.updateClient(c.id, data); m.close(); refresh(); toast('Data klien disimpan');
      } else {
        data.startDate = PT.today();
        if (pkg) { data.pkgTotal = pkg; data.pkgStart = PT.today(); }
        const nc = PT.addClient(data);
        if (num(d.weight)) PT.addMeasure({ clientId: nc.id, date: PT.today(), weight: num(d.weight) });
        m.close(); location.hash = '#/klien/' + nc.id; toast('Klien ditambahkan');
      }
    };
    const del = m.el.querySelector('[data-del]');
    if (del) del.onclick = async () => {
      if (!(await confirmBox('Hapus klien ini?', `Semua sesi & pengukuran ${esc(c.name)} ikut terhapus permanen. Kalau klien cuma berhenti sementara, cukup matikan "Klien aktif".`, 'Hapus permanen', true))) return;
      PT.clientPhotoIds(c.id).forEach(pid => Photos.remove(pid));
      PT.removeClient(c.id); m.close(); location.hash = '#/klien'; toast('Klien dihapus');
    };
  }

  /* ---------- form pengukuran ---------- */
  function openMeasure(cid) {
    const c = PT.client(cid), last = PT.measuresOf(cid).slice(-1)[0] || {};
    const inp = (n, ph) => `<input name="${n}" type="text" inputmode="decimal" placeholder="${ph != null ? esc(f1(ph)) : ''}">`;
    const m = modal(`${mhead('Catat pengukuran', esc(c.name))}
      <form class="mbody form" id="mform">
        <div class="row2"><div class="field"><label>Tanggal</label><input type="date" name="date" value="${PT.today()}"></div>
          <div class="field"><label>Berat badan * <small>kg</small></label><input name="weight" type="text" inputmode="decimal" required placeholder="${last.weight != null ? esc(f1(last.weight)) : ''}"></div></div>
        <div class="row2"><div class="field"><label>Body fat <small>%</small></label>${inp('bodyFat', last.bodyFat)}</div><div class="field"><label>Pinggang <small>cm</small></label>${inp('waist', last.waist)}</div></div>
        <div class="row2"><div class="field"><label>Lengan <small>cm</small></label>${inp('arm', last.arm)}</div><div class="field"><label>Paha <small>cm</small></label>${inp('thigh', last.thigh)}</div></div>
        <p class="muted small">Angka abu-abu = pengukuran terakhir. Kosongkan yang gak diukur.</p>
      </form>
      <div class="mfoot"><button class="btn" data-close>Batal</button><button class="btn primary" type="submit" form="mform">Simpan</button></div>`);
    $('#mform', m.el).onsubmit = e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      if (!num(d.weight)) { toast('Isi berat badan dulu (mis. 62,5)', 'err'); return; }
      const opt = k => String(d[k] || '').trim() === '' ? null : num(d[k]);
      PT.addMeasure({ clientId: cid, date: d.date || PT.today(), weight: num(d.weight), bodyFat: opt('bodyFat'), waist: opt('waist'), arm: opt('arm'), thigh: opt('thigh') });
      m.close(); UI.ctab[cid] = 'tubuh'; refresh(); toast('Pengukuran disimpan');
    };
  }

  /* ============================================================
     CATAT SESI (Hevy-style: angka sesi lalu jadi patokan)
     ============================================================ */
  let D = null, PREV = {}, draftT;
  const prevOf = name => (name in PREV) ? PREV[name] : (PREV[name] = PT.lastOf(D.clientId, name, D.id));
  const topReps = r => { const n = parseInt(String(r || '').split('-').pop(), 10); return isFinite(n) ? n : ''; };
  const blankRows = n => Array.from({ length: n }, () => ({ kg: '', reps: '', done: false }));
  const hasData = d => d.exercises.some(e => e.rows.some(r => r.done || r.kg !== '' || r.reps !== ''))
    || (d.photos || []).some(p => !(d.origPhotos || []).includes(p.id));
  const POSES = [['depan', 'Depan'], ['samping', 'Samping'], ['belakang', 'Belakang']];
  const PH_BUSY = new Set();   // pose yang fotonya masih diproses
  function photoSlots() {
    const ph = D.photos || [];
    return `<div class="sec-h"><h3>Foto progres klien</h3><span class="muted small">opsional</span></div>
      <p class="muted small">Jadi before–after di laporan PDF. Ambil dari posisi & jarak yang sama tiap kali.</p>
      <div class="pslots">${POSES.map(([k, l]) => { const p = ph.find(x => x.pose === k); return PH_BUSY.has(k)
        ? `<div class="pslot busy"><div class="spinner"></div><span>Memproses…</span></div>` : p
        ? `<div class="pslot has"><img data-photo="${esc(p.id)}" alt="Foto ${l}"><span>${l}</span><button type="button" class="iconbtn xs" data-act="log-phdel" data-pose="${k}" aria-label="Hapus foto ${l}">${icon('x')}</button></div>`
        : `<label class="pslot">${icon('camera')}<span>${l}</span><input type="file" accept="image/*" data-lph="${k}" hidden></label>`; }).join('')}</div>`;
  }
  const paintPhotos = () => { const el = $('#logPh'); if (el) el.innerHTML = photoSlots(); };
  function persistDraft() { clearTimeout(draftT); draftT = setTimeout(flushDraft, 300); }
  function flushDraft() { clearTimeout(draftT); if (D) { PT.S.draft = D; PT.save(); } }

  function applyDay(d, prog, day) {
    d.programId = prog && day ? prog.id : '';
    d.dayName = day ? day.name : '';
    d.exercises = day ? day.exercises.map(e => ({ name: e.name, target: { sets: +e.sets || 3, reps: e.reps || '' }, rows: blankRows(+e.sets || 3) })) : [];
  }
  function draftFrom(clientId, sessionId) {
    const S = PT.S;
    if (sessionId) {
      if (S.draft && S.draft.id === sessionId) return S.draft;
      const s = S.sessions.find(x => x.id === sessionId); if (!s) return null;
      return {
        id: s.id, clientId: s.clientId, date: s.date, programId: s.programId || '', dayName: s.dayName || '', notes: s.notes || '',
        exercises: s.exercises.map(e => ({ name: e.name, target: null, rows: e.sets.map(x => ({ kg: String(x[0]).replace('.', ','), reps: String(x[1]), done: true })) })),
        photos: (s.photos || []).map(p => ({ id: p.id, pose: p.pose })), origPhotos: (s.photos || []).map(p => p.id),
      };
    }
    if (S.draft && S.draft.clientId === clientId && !S.draft.id) return S.draft;
    const c = PT.client(clientId); if (!c) return null;
    const d = { id: '', clientId, date: PT.today(), programId: '', dayName: '', notes: '', exercises: [], photos: [], origPhotos: [] };
    const prog = PT.program(c.programId);
    if (prog) applyDay(d, prog, PT.nextDay(clientId, prog));
    return d;
  }
  function renderLog(clientId, sessionId) {
    if (expired()) { location.replace('#/klien' + (clientId ? '/' + clientId : '')); openCheckout(); return; }
    D = draftFrom(clientId, sessionId);
    const c = D && PT.client(D.clientId);
    if (!c) { D = null; location.replace('#/klien'); return; }
    PREV = {};
    const prog = PT.program(D.programId) || PT.program(c.programId);
    shell('klien', `
      <div class="focus-head"><button class="iconbtn" data-act="log-leave" aria-label="Kembali">${icon('back')}</button>
        <div class="fh-t"><h2>${D.id ? 'Edit sesi' : 'Catat sesi'}</h2><p>${esc(c.name)}</p></div>
        <button class="btn primary sm" data-act="log-save">Simpan</button></div>
      <div class="log-top">
        <label class="datein">${icon('cal')}<input type="date" data-lf="date" value="${D.date}" max="${PT.today()}" aria-label="Tanggal sesi"></label>
        ${prog ? `<div class="daypick"><span class="lbl">Latihan hari ini · ${esc(prog.name)}</span><div class="chips">${prog.days.map((d, i) => `<button class="chip ${D.dayName === d.name ? 'on' : ''}" data-act="log-day" data-i="${i}">${esc(d.name)}</button>`).join('')}<button class="chip ${!D.dayName ? 'on' : ''}" data-act="log-day" data-i="-1">Bebas</button></div></div>`
          : `<p class="muted small">${esc(firstName(c.name))} belum pakai program — tambah gerakan manual di bawah, atau <a class="link" data-act="client-edit" data-id="${c.id}">pilih program</a>.</p>`}
      </div>
      <div id="logEx"></div>
      <button class="btn block dashed" data-act="log-addex">${icon('plus')}Tambah gerakan</button>
      <div class="field log-notes"><label>Catatan sesi <small>opsional</small></label><textarea data-lf="notes" rows="2" placeholder="mis. Energi bagus, lutut aman, next naikin squat">${esc(D.notes || '')}</textarea></div>
      <section class="card ppics" id="logPh">${photoSlots()}</section>
      <div class="savebar"><div class="sb-sum" id="logSum"></div><button class="btn primary" data-act="log-save">${icon('check')}Simpan sesi</button></div>`, { focus: true });
    paintLog();
  }
  function exBlock(e, ei) {
    const prev = prevOf(e.name);
    const tgt = e.target ? `${e.target.sets} × ${e.target.reps}` : '';
    return `<section class="exb card" data-e="${ei}">
      <div class="exb-h">${thumb(e.name)}<div class="exb-t"><b>${esc(e.name)}</b><small>${prev ? `Terakhir ${PT.fmtDate(prev.date, false)}: <b>${setTxt(prev.best)}</b>` : 'Belum pernah dicatat'}${tgt ? ` · Target ${esc(tgt)}` : ''}</small></div>
        <button class="iconbtn xs" data-act="log-delex" data-e="${ei}" aria-label="Hapus gerakan">${icon('trash')}</button></div>
      ${exNotes(e.name)}
      <div class="set-h"><span>Set</span><span>Sebelumnya</span><span>kg</span><span>Reps</span><span>${icon('check')}</span></div>
      ${e.rows.map((r, ri) => setRow(e, ei, r, ri, prev)).join('')}
      <div class="exb-f"><button class="btn sm ghost" data-act="log-addset" data-e="${ei}">${icon('plus')}Set</button>${e.rows.length > 1 ? `<button class="btn sm ghost" data-act="log-delset" data-e="${ei}">Hapus set terakhir</button>` : ''}</div>
    </section>`;
  }
  function setRow(e, ei, r, ri, prev) {
    const p = prev ? (prev.sets[ri] || prev.sets[prev.sets.length - 1]) : null;
    const phKg = p && p[0] ? String(p[0]).replace('.', ',') : '';
    const phReps = p ? p[1] : (e.target ? topReps(e.target.reps) : '');
    return `<div class="set ${r.done ? 'done' : ''}" data-e="${ei}" data-r="${ri}">
      <span class="sn">${ri + 1}</span>
      <span class="sp">${p ? (p[0] ? `${f1(p[0])} × ${p[1]}` : `BW × ${p[1]}`) : '—'}</span>
      <input data-lf="kg" data-e="${ei}" data-r="${ri}" inputmode="decimal" value="${esc(r.kg)}" placeholder="${phKg}" aria-label="kg set ${ri + 1}">
      <input data-lf="reps" data-e="${ei}" data-r="${ri}" inputmode="numeric" value="${esc(r.reps)}" placeholder="${phReps}" aria-label="reps set ${ri + 1}">
      <button class="tick" data-act="log-tick" data-e="${ei}" data-r="${ri}" aria-label="Tandai set ${ri + 1} selesai">${icon('check')}</button>
    </div>`;
  }
  function paintLog() {
    const el = $('#logEx'); if (!el) return;
    el.innerHTML = D.exercises.length ? D.exercises.map(exBlock).join('')
      : emptyBox('dumbbell', 'Belum ada gerakan', 'Pilih latihan hari ini di atas, atau tambah gerakan manual.');
    paintSum();
  }
  function paintEx(ei) { const old = $(`.exb[data-e="${ei}"]`); if (old) old.outerHTML = exBlock(D.exercises[ei], ei); paintSum(); }
  // kg kosong di set yang selesai = pakai kg sesi sebelumnya (angka abu-abu)
  function rowKg(e, r, ri) {
    if (r.kg !== '') return num(r.kg);
    const p = prevOf(e.name), ps = p && (p.sets[ri] || p.sets[p.sets.length - 1]);
    return ps ? ps[0] : 0;
  }
  function paintSum() {
    let sets = 0, vol = 0;
    D.exercises.forEach(e => e.rows.forEach((r, ri) => { if (r.done) { sets++; vol += rowKg(e, r, ri) * num(r.reps); } }));
    const el = $('#logSum');
    if (el) el.innerHTML = sets ? `<b>${sets}</b> set selesai · <b>${fmt(vol)}</b> kg` : 'Isi angka atau tap ✓ untuk pakai angka sesi lalu';
  }
  function leaveLog() {
    const cid = D.clientId, editing = !!D.id;
    const go = () => { clearTimeout(draftT); D = null; location.hash = '#/klien/' + cid; };
    const dirty = editing ? (PT.S.draft && PT.S.draft.id === D.id) : hasData(D);
    if (!dirty) { if (!editing && PT.S.draft && PT.S.draft.clientId === cid && !PT.S.draft.id) { PT.S.draft = null; PT.save(); } return go(); }
    flushDraft();
    const m = modal(`<div class="confirm"><h3>${editing ? 'Buang perubahan?' : 'Keluar dari sesi?'}</h3>
      <p>${editing ? 'Perubahan di sesi ini belum disimpan.' : 'Isian kamu bisa disimpan sebagai draft dan dilanjut nanti.'}</p>
      <div class="col">${editing ? '' : '<button class="btn primary block" data-k="keep">Simpan draft & keluar</button>'}
        <button class="btn danger block" data-k="drop">${editing ? 'Buang perubahan' : 'Buang sesi ini'}</button>
        <button class="btn ghost block" data-close>Lanjut isi</button></div></div>`, { cls: 'small' });
    m.el.addEventListener('click', e => {
      const k = e.target.closest('[data-k]'); if (!k) return;
      if (k.dataset.k === 'drop') {
        (D.photos || []).filter(p => !(D.origPhotos || []).includes(p.id)).forEach(p => Photos.remove(p.id));
        PT.S.draft = null; PT.save();
      }
      m.close(); go();
    });
  }
  function saveLog() {
    const exercises = D.exercises.map(e => ({
      name: e.name,
      sets: e.rows.map((r, ri) => (r.done && num(r.reps) > 0) ? [rowKg(e, r, ri), num(r.reps)] : null).filter(Boolean),
    })).filter(e => e.sets.length);
    if (!exercises.length) { toast('Tandai minimal 1 set dulu ya', 'err'); return; }
    if (PH_BUSY.size) { toast('Tunggu sebentar — foto masih diproses', 'err'); return; }
    const prs = PT.detectPRs(D.clientId, exercises, D.id);
    const photos = (D.photos || []).map(p => ({ id: p.id, pose: p.pose }));
    (D.origPhotos || []).filter(id => !photos.some(p => p.id === id)).forEach(id => Photos.remove(id));
    PT.saveSession({ id: D.id || undefined, clientId: D.clientId, date: D.date, programId: D.programId, dayName: D.dayName, notes: String(D.notes || '').trim(), exercises, photos });
    clearTimeout(draftT);
    PT.S.draft = null; PT.save();
    const cid = D.clientId; D = null;
    UI.ctab[cid] = 'ringkas';
    location.hash = '#/klien/' + cid;
    toast(prs.length ? `Sesi tersimpan · PR baru: ${shortName(prs[0].name)} ${f1(prs[0].kg)} kg!` : photos.length ? `Sesi & ${photos.length} foto tersimpan` : 'Sesi tersimpan');
  }

  /* ---------- picker gerakan ---------- */
  function openPicker(onPick) {
    let g = 'all', q = '';
    const chips = [['all', 'Semua'], ['mine', 'Buatanku']].concat(GROUPS.slice(1));
    const m = modal(`${mhead('Tambah gerakan', `${LIB.length} gerakan siap pakai · bisa bikin sendiri`)}
      <label class="search pk-search">${icon('search')}<input id="pkq" type="search" placeholder="Cari gerakan (mis. bench, squat)…" autocomplete="off"></label>
      <div class="chips pk-groups">${chips.map(([k, l]) => `<button class="chip ${k === 'all' ? 'on' : ''}" data-g="${k}">${l}</button>`).join('')}</div>
      <div class="pk-list" id="pkl"></div>`, { cls: 'tall' });
    const item = e => `<button class="pk-item" data-pk="${esc(e.name)}">${thumb(e.name)}<span><b>${esc(e.name)}${e.custom ? ' <em class="mine">Buatanmu</em>' : ''}</b><small>${esc(groupLabel(e.group))}${e.equipment ? ' · ' + esc(e.equipment) : ''}</small></span></button>`;
    const createBtn = label => `<button class="pk-item custom" data-create>${icon('camera')}<span><b>${label}</b><small>Pakai foto mesin/gerakan + catatan sendiri</small></span></button>`;
    const paint = () => {
      const qt = q.trim(), list = searchEx(qt, g);
      let html = qt && !list.some(e => e.name.toLowerCase() === qt.toLowerCase())
        ? createBtn(`Buat gerakan "${esc(qt)}"`) : createBtn('Buat gerakan sendiri');
      if (!qt && g === 'all') {
        const top = PT.topExercises(8).map(n => Object.assign(exInfo(n), { custom: !!PT.customEx(n) }));
        if (top.length) html += `<div class="pk-label">Sering kamu pakai</div>${top.map(item).join('')}<div class="pk-label">Semua gerakan</div>`;
      }
      html += list.slice(0, 150).map(item).join('');
      if (g === 'mine' && !list.length) html += '<p class="muted small" style="padding:14px 8px">Belum ada gerakan buatanmu. Bikin sekali, langsung bisa dipakai di semua sesi & program.</p>';
      $('#pkl', m.el).innerHTML = html;
      $('#pkl', m.el).scrollTop = 0;
    };
    paint();
    $('#pkq', m.el).addEventListener('input', e => { q = e.target.value; paint(); });
    m.el.addEventListener('click', e => {
      const gb = e.target.closest('[data-g]');
      if (gb) { g = gb.dataset.g; $$('[data-g]', m.el).forEach(b => b.classList.toggle('on', b === gb)); paint(); return; }
      if (e.target.closest('[data-create]')) { openCustomEx({ name: q.trim() }, x => { m.close(); onPick(x.name); }); return; }
      const pk = e.target.closest('[data-pk]');
      if (pk) { m.close(); onPick(pk.dataset.pk); }
    });
    if (matchMedia('(min-width: 700px)').matches) setTimeout(() => $('#pkq', m.el).focus(), 60);
  }

  /* ---------- gerakan buatan sendiri (foto mesin/gerakan + catatan) ---------- */
  const CGROUPS = GROUPS.slice(1).concat([['Other', 'Lainnya']]);
  function photoPicker(id, label) {
    return id
      ? `<div class="ph-wrap"><img data-photo="${esc(id)}" alt=""><div class="ph-acts"><label class="btn sm">${icon('camera')}Ganti<input type="file" accept="image/*" data-ph="set" hidden></label><button type="button" class="btn sm danger" data-ph="del">${icon('trash')}</button></div></div>`
      : `<label class="ph-add">${icon('camera')}<b>${label}</b><small>Ambil foto atau pilih dari galeri</small><input type="file" accept="image/*" data-ph="set" hidden></label>`;
  }
  function openCustomEx(init, onSaved) {
    const ex = init && init.id ? PT.customExById(init.id) : null;
    const v = Object.assign({ name: '', group: '', equipment: '', notes: '', photo: '' }, ex || init || {});
    let photo = v.photo || '', fresh = null, saved = false, phBusy = false;
    const m = modal(`${mhead(ex ? 'Edit gerakan' : 'Gerakan baru', 'Foto & catatan ini muncul tiap kamu catat sesi')}
      <form class="mbody form" id="xform" autocomplete="off">
        <div id="xph">${photoPicker(photo, 'Foto mesin / gerakan')}</div>
        <div class="field"><label>Nama gerakan *</label><input name="name" required maxlength="80" value="${esc(v.name)}" placeholder="mis. Hack Squat (mesin di gym)"></div>
        <div class="field"><label>Otot utama</label>${pick('group', CGROUPS, v.group)}</div>
        <div class="field"><label>Alat</label>${pick('equipment', EQUIPS.map(x => [x, x]), v.equipment)}</div>
        <div class="field"><label>Catatan <small>setting mesin, posisi, tempo, tips</small></label><textarea name="notes" rows="4" maxlength="1000" placeholder="mis. Kursi angka 4, sandaran 2. Turun 3 detik, jangan kunci lutut di atas.">${esc(v.notes)}</textarea></div>
      </form>
      <div class="mfoot">${ex ? `<button class="btn danger" data-xdel aria-label="Hapus gerakan">${icon('trash')}</button>` : ''}<button class="btn" data-close>Batal</button><button class="btn primary" type="submit" form="xform">Simpan gerakan</button></div>`,
      { cls: 'tall', onClose: () => { if (fresh && !saved) Photos.remove(fresh); } });
    const paintPh = () => { $('#xph', m.el).innerHTML = photoPicker(photo, 'Foto mesin / gerakan'); };
    m.el.addEventListener('change', async e => {
      const inp = e.target.closest('input[data-ph="set"]'); if (!inp || !inp.files[0]) return;
      $('#xph', m.el).innerHTML = '<div class="ph-add busy"><div class="spinner"></div><b>Memproses foto…</b></div>';
      phBusy = true;
      try {
        const id = await Photos.add(inp.files[0]);
        if (fresh) Photos.remove(fresh);
        fresh = id; photo = id;
      } catch (err) { toast(err.message, 'err'); }
      phBusy = false; paintPh();
    });
    m.el.addEventListener('click', e => {
      if (e.target.closest('[data-ph="del"]')) { if (photo === fresh) { Photos.remove(fresh); fresh = null; } photo = ''; paintPh(); }
    });
    $('#xform', m.el).onsubmit = e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const name = String(d.name || '').trim().replace(/\s+/g, ' ');
      if (!name) return;
      if (phBusy) { toast('Tunggu sebentar — foto masih diproses', 'err'); return; }
      const dup = PT.customEx(name);
      if (dup && (!ex || dup.id !== ex.id)) { toast('Nama ini sudah dipakai gerakan buatanmu', 'err'); return; }
      const old = ex && ex.photo;
      const x = PT.saveCustomEx({ id: ex ? ex.id : undefined, name, group: d.group || 'Other', equipment: d.equipment || '', notes: String(d.notes || '').trim(), photo });
      if (old && old !== photo) Photos.remove(old);
      saved = true; m.close();
      toast(ex ? 'Gerakan diperbarui' : 'Gerakan disimpan');
      if (onSaved) onSaved(x); else refresh();
    };
    const del = m.el.querySelector('[data-xdel]');
    if (del) del.onclick = async () => {
      if (!(await confirmBox('Hapus gerakan ini?', 'Riwayat sesi yang sudah tercatat tetap aman.', 'Hapus', true))) return;
      if (ex.photo) Photos.remove(ex.photo);
      if (fresh && fresh !== ex.photo) Photos.remove(fresh);
      saved = true; PT.removeCustomEx(ex.id); m.close(); refresh(); toast('Gerakan dihapus');
    };
  }
  // Panel foto + catatan gerakan (di layar catat sesi & riwayat gerakan)
  function exNotes(name) {
    const e = exInfo(name);
    if (!e.custom || (!e.photo && !e.notes)) return '';
    return `<details class="exnote">${e.photo ? `<summary>${icon('camera')}Foto & catatan</summary>` : `<summary>${icon('file')}${e.custom ? 'Catatan' : 'Cara melakukan'}</summary>`}
      <div class="exnote-b">${e.photo ? `<div class="ph-wrap sm"><img data-photo="${esc(e.photo)}" alt=""></div>` : ''}<p>${esc(e.notes || e.desc || '')}</p>
      ${e.custom ? `<button type="button" class="btn sm ghost" data-act="cex-edit" data-id="${e.id}">${icon('edit')}Edit gerakan</button>` : ''}</div></details>`;
  }

  /* ============================================================
     PROGRAM
     ============================================================ */
  let P = null;
  function renderPrograms() {
    const ps = PT.S.programs;
    shell('program', `
      <div class="phead"><div><p class="eyebrow">Template latihan</p><h1>Program</h1></div>
        <button class="btn primary sm" data-act="prog-new">${icon('plus')}<span>Program</span></button></div>
      <p class="lead muted">Bikin sekali, pakai buat banyak klien. Saat catat sesi, gerakan & target set langsung keisi otomatis.</p>
      <div class="plist">${ps.map(p => {
        const n = PT.programClients(p.id).length, ex = p.days.reduce((t, d) => t + d.exercises.length, 0);
        return `<a class="pcard" href="#/program/${p.id}"><div class="pcard-top"><b>${esc(p.name)}</b>${icon('chev', 'chev')}</div>
          ${p.desc ? `<p class="muted small">${esc(p.desc)}</p>` : ''}
          <div class="pcard-meta"><span>${p.days.length} hari</span><span>${ex} gerakan</span><span>${n} klien</span></div>
          <div class="daychips">${p.days.map(d => `<span class="daychip">${esc(d.name)}</span>`).join('')}</div></a>`;
      }).join('') || emptyBox('list', 'Belum ada program', 'Bikin template latihan buat klien kamu.', `<button class="btn primary" data-act="prog-new">${icon('plus')}Program baru</button>`)}</div>
      <section class="card">
        <div class="sec-h"><div><h3>Gerakan buatanmu</h3><p class="muted small">Gerakan yang gak ada di library — lengkap dengan foto mesin & catatan.</p></div></div>
        ${(PT.S.customExercises || []).length ? `<div class="lrows">${PT.S.customExercises.map(x => `<button class="lrow" data-act="cex-edit" data-id="${x.id}">${thumb(x.name)}
            <span class="lrow-main"><b>${esc(x.name)}</b><small>${esc([groupLabel(x.group), x.equipment].filter(Boolean).join(' · '))}${x.notes ? ' · ada catatan' : ''}</small></span>${icon('chev', 'chev')}</button>`).join('')}</div>` : ''}
        <button class="btn block dashed" data-act="cex-new" style="margin-top:10px">${icon('camera')}Buat gerakan sendiri</button>
      </section>`);
  }
  function renderProgramEdit(id) {
    if (id === 'baru') {
      if (expired()) { location.replace('#/program'); openCheckout(); return; }
      P = { id: '', name: '', desc: '', days: [{ id: PT.uid('d'), name: 'Hari 1', exercises: [] }] };
    } else {
      const p = PT.program(id); if (!p) { location.replace('#/program'); return; }
      P = JSON.parse(JSON.stringify(p));
    }
    const users = P.id ? PT.programClients(P.id) : [];
    shell('program', `
      <div class="focus-head"><a href="#/program" class="iconbtn" aria-label="Kembali">${icon('back')}</a>
        <div class="fh-t"><h2>${P.id ? 'Edit program' : 'Program baru'}</h2><p>${P.id ? esc(P.name) : 'Template latihan'}</p></div>
        <button class="btn primary sm" data-act="prog-save">Simpan</button></div>
      <section class="card form">
        <div class="field"><label>Nama program *</label><input data-pf="name" value="${esc(P.name)}" placeholder="mis. Upper / Lower 4×"></div>
        <div class="field"><label>Deskripsi singkat</label><input data-pf="desc" value="${esc(P.desc || '')}" placeholder="mis. 4× seminggu · naik otot"></div>
      </section>
      <div id="pdays"></div>
      <button class="btn block dashed" data-act="pday-add">${icon('plus')}Tambah hari latihan</button>
      ${P.id ? `<div class="pfoot"><p class="muted small">${users.length ? `Dipakai ${users.length} klien: ${users.map(u => esc(u.name)).join(', ')}` : 'Belum dipakai klien.'}</p>
        <button class="btn danger" data-act="prog-del">${icon('trash')}Hapus program</button></div>` : ''}
      <div class="savebar"><div class="sb-sum">Perubahan berlaku untuk sesi berikutnya</div><button class="btn primary" data-act="prog-save">${icon('check')}Simpan program</button></div>`, { focus: true });
    paintPDays();
  }
  function paintPDays() {
    $('#pdays').innerHTML = P.days.map((d, di) => `<section class="card pday">
      <div class="pday-h"><span class="pday-n">${di + 1}</span><input data-pf="dayname" data-d="${di}" value="${esc(d.name)}" placeholder="Nama hari (mis. Upper A)" aria-label="Nama hari">
        <button class="iconbtn xs" data-act="pday-del" data-d="${di}" aria-label="Hapus hari">${icon('trash')}</button></div>
      ${d.exercises.length ? '<div class="pex-h"><span class="c1">Set</span><span class="c2"></span><span class="c3">Reps</span></div>' : ''}
      ${d.exercises.map((e, xi) => `<div class="pex">${thumb(e.name, 'sm')}<span class="pex-name">${esc(e.name)}</span>
        <input class="mini" data-pf="sets" data-d="${di}" data-x="${xi}" value="${esc(e.sets)}" inputmode="numeric" aria-label="Jumlah set">
        <span class="x">×</span>
        <input class="mini w" data-pf="reps" data-d="${di}" data-x="${xi}" value="${esc(e.reps)}" aria-label="Reps">
        <button class="iconbtn xs" data-act="pex-del" data-d="${di}" data-x="${xi}" aria-label="Hapus gerakan">${icon('x')}</button></div>`).join('')
        || '<p class="muted small" style="padding:4px 0 6px">Belum ada gerakan di hari ini.</p>'}
      <button class="btn sm soft" data-act="pex-add" data-d="${di}">${icon('plus')}Tambah gerakan</button>
    </section>`).join('') || '<p class="muted small">Belum ada hari latihan.</p>';
  }

  /* ============================================================
     LAPORAN PDF
     ============================================================ */
  const defaultNotes = c => `Kerja bagus bulan ini, ${firstName(c.name)}! Konsistensi kamu kelihatan dari angka-angka di laporan ini.\n\nFokus bulan depan:\n- \n- `;
  function reportPreview(R) {
    const prevLbl = R.vs;
    const dS = R.cur.sessions - R.prev.sessions;
    const dV = R.prev.volume ? (R.cur.volume - R.prev.volume) / R.prev.volume * 100 : null;
    const dW = R.curM && R.prevM && R.prevM.date !== R.curM.date ? R.curM.weight - R.prevM.weight : null;
    const cls = (v, dir = 1) => v == null || !dir || Math.abs(v) < 0.05 ? '' : v * dir > 0 ? 'up' : 'down';
    return `<div class="rkpis">
        <div><small>Sesi latihan</small><b>${R.cur.sessions}</b><span class="${cls(dS)}">${dS > 0 ? '+' : ''}${dS} vs ${prevLbl}</span></div>
        <div><small>Total volume</small><b>${fmt(R.cur.volume)} kg</b><span class="${cls(dV)}">${dV == null ? '—' : (dV > 0 ? '+' : '') + fmt(dV) + '% vs ' + prevLbl}</span></div>
        <div><small>Berat badan</small><b>${R.curM ? f1(R.curM.weight) + ' kg' : '—'}</b><span class="${cls(dW, weightDir(R.c.goal))}">${dW == null ? '—' : (dW > 0 ? '+' : '') + f1(dW) + ' kg vs ' + PT.monthLabel(PT.prevMonth(R.key)).split(' ')[0]}</span></div>
        <div><small>Kekuatan</small><b>${R.strength == null ? '—' : (R.strength > 0 ? '+' : '') + f1(R.strength) + '%'}</b><span>rata-rata gerakan utama</span></div>
      </div>
      <div><p class="sub-h" style="margin-bottom:8px">Highlight di laporan</p><ul class="rhl">${R.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul></div>`;
  }
  function openReport(cid) {
    const c = PT.client(cid);
    const months = PT.monthsWithData(cid);
    let key = months.find(k => PT.monthStats(cid, k).sessions) || months[0];
    const m = modal(`${mhead('Laporan progres', esc(c.name) + ' · PDF + perbandingan bulan sebelumnya')}
      <div class="mbody">
        <div class="field"><label>Bulan laporan</label><select id="rmonth">${months.map(k => `<option value="${k}" ${k === key ? 'selected' : ''}>${PT.monthLabel(k, true)}</option>`).join('')}</select></div>
        <div id="rprev"></div>
        <div id="rba"></div>
        <div class="field"><label>Pesan coach <small>ikut masuk ke PDF</small></label><textarea id="rnotes" rows="5"></textarea></div>
        ${c.phone ? '' : `<div class="note">${icon('alert')}<p>Nomor WhatsApp klien belum diisi. <a class="link" data-act="client-edit" data-id="${cid}">Tambah nomor</a> biar laporan bisa langsung dikirim.</p></div>`}
      </div>
      <div class="mfoot"><button class="btn" data-r="dl">${icon('download')}PDF</button><button class="btn wa grow" data-r="wa">${icon('wa')}Kirim ke WA</button></div>`, { cls: 'wide' });
    const btns = () => $$('[data-r]', m.el);
    const paint = () => {
      $('#rprev', m.el).innerHTML = reportPreview(Report.summary(cid, key));
      $('#rnotes', m.el).value = (c.reportNotes && c.reportNotes[key] != null) ? c.reportNotes[key] : defaultNotes(c);
      // foto before–after disiapkan dulu (dari HP / server) supaya tombol kirim tetap instan
      const ba = PT.beforeAfter(cid, key + '-31'), box = $('#rba', m.el);
      box.innerHTML = ba ? `<div><p class="sub-h" style="margin-bottom:8px">Before – after di PDF</p><div class="ba mini">
          <div class="ba-side"><img data-photo="${esc(ba.before.id)}" alt=""><span class="ba-tag">Before</span><small>${PT.fmtDate(ba.before.date)}</small></div>
          <div class="ba-side"><img data-photo="${esc(ba.after.id)}" alt=""><span class="ba-tag">After</span><small>${PT.fmtDate(ba.after.date)}</small></div></div></div>`
        : `<p class="muted small">${icon('camera')} Before–after muncul di PDF setelah ada foto progres klien di 2 tanggal berbeda.</p>`;
      btns().forEach(b => { b.disabled = true; });
      Report.prepare(cid, key).catch(() => null).then(() => btns().forEach(b => { b.disabled = false; }));
    };
    paint();
    $('#rmonth', m.el).onchange = e => { key = e.target.value; paint(); };
    $('#rnotes', m.el).oninput = e => { c.reportNotes = c.reportNotes || {}; c.reportNotes[key] = e.target.value; PT.save(); };
    m.el.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) makeReport(cid, key, b.dataset.r, $('#rnotes', m.el).value); });
  }
  function makeReport(cid, key, mode, notes) {
    if (!window.jspdf) { toast('Modul PDF belum termuat — cek koneksi internet lalu coba lagi', 'err'); return; }
    const c = PT.client(cid);
    let out;
    try { out = Report.build(cid, key, notes); } catch (err) { console.error(err); toast('Gagal membuat PDF', 'err'); return; }
    if (mode === 'dl') { Report.download(out); toast('PDF laporan diunduh'); return; }
    Report.sendWA(out, c.phone).then(r => {
      if (r === 'shared') toast('Laporan terkirim');
      else if (r === 'fallback') waHelp(out, c);
      else if (r === 'error') { Report.download(out); waHelp(out, c); }
    });
  }
  function waHelp(out, c) {
    modal(`<div class="confirm"><div class="okc" style="background:var(--wa);color:#fff">${icon('check')}</div>
      <h3>PDF sudah diunduh</h3>
      <p>Chat WhatsApp ${esc(firstName(c.name) || 'klien')} dibuka dengan pesan siap kirim. Tinggal lampirkan file <b>${esc(out.filename)}</b> di chat itu.</p>
      <div class="col"><a class="btn wa block" href="${Report.waUrl(c.phone, out.waText)}" target="_blank" rel="noopener">${icon('wa')}Buka WhatsApp lagi</a><button class="btn ghost block" data-close>Selesai</button></div></div>`, { cls: 'small' });
  }

  /* ============================================================
     AKUN, LANGGANAN, PENGINGAT
     ============================================================ */
  function renderAccount() {
    const a = PT.S.account, s = PT.sub(), C = PT.CONFIG;
    const pct = s.status === 'trial' ? Math.min(100, Math.max(4, (1 - (s.end - Date.now()) / (C.trialDays * PT.DAY)) * 100)) : 0;
    const pill = s.status === 'trial' ? '<span class="pill info">Trial</span>' : s.status === 'active' ? `<span class="pill ${s.daysLeft <= C.bannerDays ? 'warn' : 'ok'}">Aktif</span>` : '<span class="pill off">Habis</span>';
    const kv = (l, v) => `<div><small>${l}</small><b>${v}</b></div>`;
    shell('akun', `
      <div class="phead"><div><p class="eyebrow">Pengaturan</p><h1>Akun</h1></div></div>
      <div class="grid2">
        <section class="card subcard">
          <div class="sec-h"><h3>Langganan</h3>${pill}</div>
          <p class="sub-big">${s.status === 'trial' ? `Trial gratis · <b>${sisa(s.daysLeft)}</b>` : s.status === 'active' ? `Paket ${s.plan ? s.plan.name : ''} · <b>${sisa(s.daysLeft)}</b>` : '<b>Langganan habis</b>'}</p>
          <p class="muted small">${s.status === 'expired' ? `Berakhir ${PT.fmtTs(s.end)}. Data kamu tetap aman.` : `Berlaku sampai ${PT.fmtTs(s.end)}`}</p>
          ${s.status === 'trial' ? `<div class="bar"><i style="width:${pct.toFixed(0)}%"></i></div>` : ''}
          <button class="btn ${s.status === 'active' && s.daysLeft > C.bannerDays ? 'soft' : 'primary'} block" data-act="checkout">${s.status === 'trial' ? 'Langganan' : s.status === 'active' ? 'Perpanjang' : 'Aktifkan lagi'} · ${rp(C.plans[0].price)}/bulan</button>
        </section>
        <section class="card">
          <div class="sec-h"><h3>Profil coach</h3><button class="btn sm ghost" data-act="acc-edit">${icon('edit')}Edit</button></div>
          <div class="kv two">${kv('Nama', esc(a.name))}${kv('Gym / brand', esc(a.gym || '—'))}${kv('WhatsApp', esc(a.phone || '—'))}${kv('Email', esc(a.email || '—'))}</div>
        </section>
      </div>
      <section class="card">
        <div class="sec-h"><h3>Pengingat langganan</h3></div>
        <p class="muted small" style="margin-bottom:12px">Kamu diingatkan di aplikasi mulai H-${C.remindDays} sebelum langganan habis, dan saat sudah habis. Aktifkan notifikasi biar muncul juga di perangkat ini.</p>
        <label class="switch"><input type="checkbox" id="notifT" ${a.notif ? 'checked' : ''}><span></span>Notifikasi di perangkat ini</label>
      </section>
      <section class="card">
        <div class="sec-h"><h3>Riwayat pembayaran</h3></div>
        ${PT.S.invoices.length ? `<div>${PT.S.invoices.map(i => `<div class="inv-row"><div><b>Paket ${esc(i.planName)}</b><small>${esc(i.id)} · ${esc(i.method)} · ${PT.fmtTs(i.date)}</small><small>Masa aktif ${PT.fmtTs(i.start)} – ${PT.fmtTs(i.end)}</small></div><div class="r"><b>${rp(i.amount)}</b><span class="pill ok">${esc(i.status)}</span></div></div>`).join('')}</div>`
          : '<p class="muted small">Belum ada pembayaran.</p>'}
      </section>
      <section class="card">
        <div class="sec-h"><h3>Data</h3></div>
        <p class="muted small">Data tersimpan di perangkat ini. Rutin backup biar aman kalau ganti HP atau hapus data browser.</p>
        <div class="btnrow"><button class="btn sm" data-act="backup">${icon('download')}Backup data</button>
          <label class="btn sm">${icon('upload')}Pulihkan<input type="file" accept="application/json,.json" id="restoreF" hidden></label>
          ${PT.S.clients.some(c => c.demo) ? '<button class="btn sm ghost" data-act="demo-del">Hapus contoh klien</button>' : ''}</div>
      </section>
      ${DEV ? `<details class="card devtools"><summary>Alat uji langganan <small>(hanya muncul dengan ?dev)</small></summary>
        <div class="btnrow"><button class="btn sm" data-sim="trial2">Trial sisa 2 hari</button><button class="btn sm" data-sim="paid5">Berbayar sisa 5 hari</button>
          <button class="btn sm" data-sim="expired">Langganan habis</button><button class="btn sm" data-sim="reset">Reset trial</button></div></details>` : ''}
      <section class="card">
        <div class="sec-h"><h3>Akun login</h3>${Cloud.enabled ? '<span class="pill ok">Tersimpan di server</span>' : '<span class="pill warn">Mode lokal</span>'}</div>
        <div class="kv two">${kv('Email', esc(Cloud.user ? Cloud.user.email : '—'))}${kv('Sinkron', Cloud.enabled ? 'Otomatis' : 'Hanya perangkat ini')}</div>
        ${Cloud.enabled ? '' : `<div class="note">${icon('alert')}<p>Server belum disambungkan: akun & data hanya tersimpan di perangkat ini. Rutin <b>Backup data</b> dulu ya.</p></div>`}
        <div class="btnrow"><button class="btn sm" data-act="password">${icon('lock')}Ganti password</button></div>
      </section>
      <button class="btn danger block" data-act="logout">${icon('logout')}Keluar</button>`);
  }
  function openAccountForm() {
    const a = PT.S.account;
    const m = modal(`${mhead('Profil coach', 'Tampil di laporan PDF klien')}
      <form class="mbody form" id="aform">
        <div class="field"><label>Nama *</label><input name="name" required value="${esc(a.name)}"></div>
        <div class="field"><label>Nama gym / brand</label><input name="gym" value="${esc(a.gym)}"></div>
        <div class="field"><label>No. WhatsApp</label><input name="phone" type="tel" inputmode="tel" value="${esc(a.phone)}"></div>
        <div class="field"><label>Email</label><input name="email" type="email" value="${esc(a.email)}"></div>
      </form>
      <div class="mfoot"><button class="btn" data-close>Batal</button><button class="btn primary" type="submit" form="aform">Simpan</button></div>`);
    $('#aform', m.el).onsubmit = e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      if (!String(d.name || '').trim()) return;
      PT.updateAccount({ name: d.name.trim(), gym: d.gym.trim(), phone: d.phone.trim(), email: d.email.trim() });
      m.close(); refresh(); toast('Profil disimpan');
    };
  }

  /* ---------- pembayaran langganan via Scalev (QRIS / Virtual Account) ---------- */
  const BANKS = [['va_bca', 'BCA'], ['va_bri', 'BRI'], ['va_bni', 'BNI'], ['va_mandiri', 'Mandiri'], ['va_bsi', 'BSI'], ['va_cimb', 'CIMB Niaga'], ['va_permata', 'Permata'],
    ['va_danamon', 'Danamon'], ['va_btn', 'BTN'], ['va_maybank', 'Maybank'], ['va_ocbc', 'OCBC'], ['va_muamalat', 'Muamalat'], ['va_bnc', 'Neo Commerce'], ['va_sahabat_sampoerna', 'Sampoerna']];
  const bankName = code => (BANKS.find(b => b[0] === code) || [0, String(code || '').replace(/^va_/, '').toUpperCase()])[1];
  const methodLabel = code => code === 'qris' ? 'QRIS' : /^va_/.test(code || '') ? 'VA ' + bankName(code) : String(code || '-');
  const fmtWhen = iso => { const d = new Date(iso); return `${d.getDate()} ${PT.MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`; };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const normPhone = p => { let d = String(p || '').replace(/\D/g, ''); if (d.startsWith('0')) d = '62' + d.slice(1); else if (d.startsWith('8')) d = '62' + d; return d; };
  function copyText(t) {
    const ok = () => toast('Tersalin: ' + t);
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(ok, () => fallback());
    fallback();
    function fallback() {
      const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, 999);
      try { document.execCommand('copy'); ok(); } catch (e) { toast('Salin manual: ' + t); }
      ta.remove();
    }
  }
  function qrSvg(str) {
    if (!window.qrcode) return '';
    const q = window.qrcode(0, 'M'); q.addData(str); q.make();
    return q.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
  }
  // Gambar QR (PNG) disiapkan duluan supaya tombol "Simpan QR" bisa langsung buka share sheet
  function qrFile(str, total) {
    return new Promise(res => {
      if (!window.qrcode) return res(null);
      const q = window.qrcode(0, 'M'); q.addData(str); q.make();
      const n = q.getModuleCount(), cell = 10, pad = 48, size = n * cell + pad * 2;
      const cv = document.createElement('canvas'); cv.width = size; cv.height = size + 70;
      const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = '#000';
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(pad + c * cell, pad + r * cell, cell, cell);
      g.fillStyle = '#111'; g.font = '700 24px sans-serif'; g.textAlign = 'center'; g.fillText(`QRIS Bodimentor PT · ${rp(total)}`, cv.width / 2, size + 30);
      cv.toBlob(b => res(b ? new File([b], 'QRIS-Bodimentor-PT.png', { type: 'image/png' }) : null), 'image/png');
    });
  }
  function saveQr() {
    const f = PAY && PAY.qrFile; if (!f) { toast('QR belum siap, tunggu sebentar', 'err'); return; }
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      navigator.share({ files: [f], title: 'QRIS Bodimentor PT' }).catch(() => { });
      return;
    }
    const url = URL.createObjectURL(f), a = document.createElement('a');
    a.href = url; a.download = f.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('QR tersimpan — buka e-wallet lalu pilih gambar dari galeri');
  }

  let PAY = null;       // sheet pembayaran yang sedang terbuka
  let METHODS = null;   // metode dari Scalev (cache)
  function openCheckout() {
    if (PAY) return;
    const m = modal('<div id="coHead"></div><div class="mbody" id="coBody"></div><div class="mfoot" id="coFoot"></div>',
      { cls: 'wide tall', onClose: () => { if (PAY) clearInterval(PAY.timer); PAY = null; } });
    PAY = { m, head: $('#coHead', m.el), body: $('#coBody', m.el), foot: $('#coFoot', m.el), timer: null, busy: false, form: null, slug: null, qrFile: null };
    m.el.addEventListener('input', e => { const f = e.target.closest('#coForm'); if (f && PAY) PAY.form[e.target.name] = e.target.value; });
    m.el.addEventListener('click', e => {
      if (!PAY) return;
      const mb = e.target.closest('[data-m]'); if (mb) { PAY.form.method = mb.dataset.m; paintMethods(); return; }
      const bk = e.target.closest('[data-bank]'); if (bk) { PAY.form.bank = bk.dataset.bank; paintMethods(); return; }
      const b = e.target.closest('[data-co]'); if (!b) return;
      const k = b.dataset.co;
      if (k === 'go') startPay();
      else if (k === 'check') checkPay(true);
      else if (k === 'retry') showPending(PAY.slug);
      else if (k === 'save-qr') saveQr();
      else if (k === 'copy') copyText(b.dataset.v);
      else if (k === 'new') { PT.setPending(null); PAY.slug = null; refresh(); showPlan(); }
      else if (k === 'activate' && PAY.retry) paidDone(PAY.retry);
    });
    const pend = PT.S.account.pending;
    if (pend) showPending(pend.slug); else showPlan();
  }

  function showPlan(errMsg) {
    const P = PAY; if (!P) return;
    const a = PT.S.account, s = PT.sub(), plan = PT.CONFIG.plans[0];
    const end = PT.paidStart() + plan.days * PT.DAY;
    P.form = P.form || { name: a.name || '', email: a.email || '', phone: a.phone || '', method: 'qris', bank: '' };
    const F = P.form;
    P.head.innerHTML = mhead(s.status === 'expired' ? 'Aktifkan lagi' : s.status === 'active' ? 'Perpanjang langganan' : 'Langganan', s.status === 'expired' ? 'Data klien kamu tetap aman.' : 'Semua fitur, klien tanpa batas.');
    P.body.innerHTML = `
      <div class="co-hero"><p class="eyebrow">Bodimentor PT Pro</p><div class="co-price">${rp(plan.price)}<small> /bulan</small></div>
        <p class="co-until">Aktif sampai <b>${PT.fmtTs(end)}</b>${s.status === 'trial' ? ' · sisa trial tetap kepakai' : s.status === 'active' ? ' · disambung dari masa aktif' : ''}</p></div>
      <div class="feat">${['Klien tanpa batas', 'Catat sesi & beban', 'Laporan PDF ke WhatsApp', 'Program & template'].map(t => `<span>${icon('check')}${t}</span>`).join('')}</div>
      <form class="form" id="coForm" autocomplete="on" onsubmit="return false">
        <p class="sub-h" style="margin-bottom:10px">Data pembayaran</p>
        <div class="field"><label>Nama</label><input name="name" value="${esc(F.name)}" autocomplete="name" placeholder="Nama kamu"></div>
        <div class="field"><label>Email <small>${Cloud.enabled ? 'email akun kamu' : 'bukti bayar dikirim ke sini'}</small></label><input name="email" type="email" inputmode="email" value="${esc(Cloud.enabled ? Cloud.user.email : F.email)}" autocomplete="email" placeholder="nama@email.com"${Cloud.enabled ? ' readonly' : ''}></div>
        <div class="field"><label>No. WhatsApp</label><input name="phone" type="tel" inputmode="tel" value="${esc(F.phone)}" autocomplete="tel" placeholder="0812xxxxxxx"></div>
      </form>
      <div><p class="sub-h" style="margin-bottom:10px">Bayar pakai</p><div class="methods" id="coMethods"><div class="paying" style="padding:14px"><div class="spinner" style="margin-bottom:0"></div></div></div></div>
      ${errMsg ? `<div class="note">${icon('alert')}<p>${esc(errMsg)}</p></div>` : ''}
      <p class="secure">${icon('shield')}Pembayaran aman diproses Scalev</p>`;
    P.foot.innerHTML = `<button class="btn primary block lg" data-co="go">Lanjut bayar ${rp(plan.price)}</button>`;
    if (METHODS) paintMethods();
    else Scalev.methods().then(ms => { METHODS = ms; paintMethods(); }).catch(e => {
      const box = $('#coMethods', P.body); if (box) box.innerHTML = `<div class="note">${icon('alert')}<p>${esc(e.message)} <a class="link" data-co="retry-m">Coba lagi</a></p></div>`;
      const r = $('[data-co="retry-m"]', P.body); if (r) r.onclick = () => showPlan();
    });
  }
  function paintMethods() {
    const P = PAY, box = P && $('#coMethods', P.body); if (!box || !METHODS) return;
    const F = P.form, codes = METHODS.map(m => m.code);
    const vas = BANKS.filter(b => codes.includes(b[0]));
    if (!codes.includes('qris') && F.method === 'qris') F.method = 'va';
    if (F.method === 'va' && !F.bank && vas.length) F.bank = vas[0][0];
    box.innerHTML = (codes.includes('qris') ? `<button type="button" class="method ${F.method === 'qris' ? 'on' : ''}" data-m="qris"><span class="mi">${icon('qr')}</span>
        <span><b>QRIS <em>Paling gampang</em></b><small>GoPay · OVO · DANA · ShopeePay · m-banking</small></span><i class="radio"></i></button>` : '')
      + (vas.length ? `<button type="button" class="method ${F.method === 'va' ? 'on' : ''}" data-m="va"><span class="mi">${icon('bank')}</span>
        <span><b>Transfer bank</b><small>Virtual Account · ${vas.slice(0, 4).map(b => b[1]).join(' · ')} · dll</small></span><i class="radio"></i></button>` : '')
      + (F.method === 'va' ? `<div class="banks">${vas.map(([c, n]) => `<button type="button" class="bank ${F.bank === c ? 'on' : ''}" data-bank="${c}">${n}</button>`).join('')}</div>` : '');
  }

  async function startPay() {
    const P = PAY; if (!P || P.busy) return;
    const F = P.form, method = F.method === 'va' ? F.bank : 'qris';
    const name = String(F.name || '').trim(), email = Cloud.enabled ? Cloud.user.email : String(F.email || '').trim(), phone = normPhone(F.phone);
    if (!name) return toast('Isi nama dulu', 'err');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Email belum benar', 'err');
    if (phone.length < 10) return toast('Nomor WhatsApp belum benar', 'err');
    if (!method) return toast('Pilih bank dulu', 'err');
    const a = PT.S.account;
    if (!a.email || !a.phone) PT.updateAccount({ email: a.email || email, phone: a.phone || F.phone });
    P.busy = true;
    P.head.innerHTML = ''; P.foot.innerHTML = '';
    P.body.innerHTML = '<div class="paying"><div class="spinner"></div><b>Membuat tagihan…</b><p>Sebentar ya.</p></div>';
    try {
      const v = Scalev.view(await Scalev.create({ customer_name: name, customer_email: email, customer_phone: phone, payment_method: method }));
      PT.setPending({ slug: v.slug, orderId: v.orderId, method, total: v.total, createdAt: Date.now() });
      P.busy = false;
      refresh();
      showPending(v.slug);
    } catch (e) {
      P.busy = false;
      showPlan(e.duplicate
        ? 'Masih ada tagihan langganan yang belum dibayar untuk email/nomor ini. Lanjutkan lewat email dari Scalev, atau coba lagi setelah tagihan itu kedaluwarsa.'
        : e.message);
    }
  }

  async function showPending(slug) {
    const P = PAY; if (!P) return;
    P.slug = slug;
    P.head.innerHTML = mhead('Selesaikan pembayaran', '');
    P.body.innerHTML = '<div class="paying"><div class="spinner"></div><b>Menyiapkan instruksi bayar…</b></div>';
    P.foot.innerHTML = '';
    try {
      let v = Scalev.view(await Scalev.order(slug));
      if (v.paid) return paidDone(v);
      if (v.dead) { PT.setPending(null); refresh(); P.form = null; return showPlan('Tagihan sebelumnya sudah kedaluwarsa. Buat tagihan baru di bawah.'); }
      if (!v.qr && !v.va) v = Scalev.view(await Scalev.pay(slug));
      for (let i = 0; i < 10 && !v.qr && !v.va && PAY; i++) { await sleep(1500); v = Scalev.view(await Scalev.order(slug)); }
      if (!PAY || PAY.slug !== slug) return;
      renderPay(v);
      clearInterval(PAY.timer);
      PAY.timer = setInterval(() => { if (!document.hidden) checkPay(false); }, 5000);
    } catch (e) {
      if (!PAY) return;
      P.body.innerHTML = `<div class="paying">${icon('alert')}<b>Gagal memuat tagihan</b><p>${esc(e.message)}</p></div>`;
      P.foot.innerHTML = '<button class="btn block lg" data-co="retry">Coba lagi</button>';
    }
  }

  function renderPay(v) {
    const P = PAY, isQr = !!v.qr;
    P.head.innerHTML = mhead('Selesaikan pembayaran', methodLabel(v.method));
    P.qrFile = null;
    const wait = `<div class="waitline"><i class="pulse"></i><span>Menunggu pembayaran…<small>Dicek otomatis${v.expiresAt ? ` · bayar sebelum ${fmtWhen(v.expiresAt)}` : ''}</small></span>
      <button class="btn sm" data-co="check">Cek</button></div>`;
    const hosted = v.hostedUrl ? `<p class="secure"><a class="link" href="${esc(v.hostedUrl)}" target="_blank" rel="noopener">Buka halaman pembayaran Scalev</a></p>` : '';
    if (isQr) {
      const svg = qrSvg(v.qr);
      P.body.innerHTML = `
        <div class="pay-head"><span class="muted">Total bayar</span><b>${rp(v.total)}</b></div>
        ${svg ? `<div class="qr-box">${svg}<div class="qr-cap">QRIS · ${esc(v.orderId || '')}</div></div>` : `<div class="note">${icon('alert')}<p>QR belum bisa ditampilkan. Pakai halaman pembayaran Scalev di bawah.</p></div>`}
        <ol class="steps">
          <li><span>Tap <b>Simpan QR</b> (atau screenshot layar ini).</span></li>
          <li><span>Buka <b>GoPay / OVO / DANA / ShopeePay / m-banking</b> → Bayar / Scan → pilih gambar QR dari galeri.</span></li>
          <li><span>Balik ke sini — langganan aktif otomatis.</span></li>
        </ol>
        ${wait}${hosted}`;
      P.foot.innerHTML = `<button class="btn block lg" data-close>Tutup</button><button class="btn primary block lg" data-co="save-qr">${icon('download')}Simpan QR</button>`;
      qrFile(v.qr, v.total).then(f => { if (PAY) PAY.qrFile = f; });
    } else {
      const bank = bankName(v.method);
      P.body.innerHTML = `
        <div class="pay-head"><span class="muted">Total bayar</span><b>${rp(v.total)}</b></div>
        <div class="va-box"><small>Nomor Virtual Account ${esc(bank)}</small>
          <div class="va-num">${esc(v.va ? v.va.replace(/(\d{4})(?=\d)/g, '$1 ') : '—')}</div>
          ${v.holder ? `<small>a.n. ${esc(v.holder)}</small>` : ''}
          <div class="btnrow" style="justify-content:center"><button class="btn sm primary" data-co="copy" data-v="${esc(v.va || '')}">Salin nomor</button><button class="btn sm" data-co="copy" data-v="${v.total}">Salin nominal</button></div></div>
        <ol class="steps">
          <li><span>Buka <b>m-banking ${esc(bank)}</b> (atau ATM / bank lain).</span></li>
          <li><span>Pilih <b>Transfer → Virtual Account</b>, tempel nomor di atas.</span></li>
          <li><span>Pastikan nominal <b>${rp(v.total)}</b>, lalu bayar. Langganan aktif otomatis.</span></li>
        </ol>
        ${wait}${hosted}`;
      P.foot.innerHTML = '<button class="btn block lg" data-close>Tutup</button>';
    }
  }

  async function checkPay(manual) {
    const P = PAY; if (!P || !P.slug || P.busy) return;
    P.busy = true;
    try {
      const v = Scalev.view(await Scalev.order(P.slug));
      if (v.paid) paidDone(v);
      else if (v.dead) { PT.setPending(null); refresh(); clearInterval(P.timer); P.form = null; showPlan('Tagihan sudah kedaluwarsa. Buat tagihan baru di bawah.'); }
      else if (manual) toast('Belum ada pembayaran masuk. Cek lagi sebentar ya');
    } catch (e) { if (manual) toast(e.message, 'err'); }
    finally { if (PAY) PAY.busy = false; }
  }

  async function paidDone(v) {
    if (!PAY) openPaidSheet();
    const P = PAY; clearInterval(P.timer); P.timer = null;
    P.m.el.classList.remove('tall');
    P.head.innerHTML = '';
    let inv;
    if (Cloud.enabled) {
      // Server memverifikasi order ke Scalev (lunas, produk & email cocok) lalu menambah 30 hari
      P.body.innerHTML = '<div class="paying"><div class="spinner"></div><b>Pembayaran diterima — mengaktifkan langganan…</b></div>'; P.foot.innerHTML = '';
      try { inv = PT.activate(v, methodLabel(v.method), await Cloud.activate(v.slug)); }
      catch (e) {
        P.retry = v;
        P.body.innerHTML = `<div class="paying">${icon('alert')}<b>Pembayaran diterima, tapi aktivasi belum berhasil</b><p>${esc(e.message)}</p></div>`;
        P.foot.innerHTML = '<button class="btn primary block lg" data-co="activate">Coba aktifkan lagi</button>';
        return;
      }
    } else inv = PT.activate(v, methodLabel(v.method));
    P.body.innerHTML = `<div class="paid"><div class="okc">${icon('check')}</div><h3>Langganan aktif!</h3>
      <p>Bodimentor PT Pro aktif sampai <b>${PT.fmtTs(inv.end)}</b>.</p><p class="muted small">Order ${esc(inv.id)} · ${esc(inv.method)}</p></div>`;
    P.foot.innerHTML = '<button class="btn primary block lg" data-close>Mantap, lanjut</button>';
    refresh();
  }
  function openPaidSheet() {
    const m = modal('<div id="coHead"></div><div class="mbody" id="coBody"></div><div class="mfoot" id="coFoot"></div>', { cls: 'wide', onClose: () => { PAY = null; } });
    PAY = { m, head: $('#coHead', m.el), body: $('#coBody', m.el), foot: $('#coFoot', m.el), timer: null, busy: false };
    m.el.addEventListener('click', e => { if (e.target.closest('[data-co="activate"]') && PAY && PAY.retry) paidDone(PAY.retry); });
  }
  // Cek tagihan yang masih menunggu walau sheet tertutup (mis. habis bayar di app bank lalu balik ke sini)
  async function watchPending() {
    const p = Cloud.user && PT.S.account && PT.S.account.pending;
    if (!p || PAY) return;
    try {
      const v = Scalev.view(await Scalev.order(p.slug));
      if (v.paid) paidDone(v);
      else if (v.dead) { PT.setPending(null); refresh(); }
    } catch (e) { /* offline — coba lagi nanti */ }
  }

  function openReminder(s) {
    const t = s.status === 'expired'
      ? { h: 'Langganan kamu sudah habis', p: 'Data klien tetap aman. Aktifkan lagi untuk lanjut catat sesi & kirim laporan.', b: 'Aktifkan lagi' }
      : s.status === 'trial'
        ? { h: s.daysLeft > 0 ? `Trial kamu tinggal ${s.daysLeft} hari` : 'Trial kamu berakhir hari ini', p: `Berakhir ${PT.fmtTs(s.end)}. Pilih paket sekarang biar pencatatan klien gak putus — sisa trial tetap kepakai.`, b: 'Pilih paket' }
        : { h: `Langganan habis ${lagi(s.daysLeft)}`, p: `Berakhir ${PT.fmtTs(s.end)}. Perpanjang sekarang, masa aktif baru langsung disambung.`, b: 'Perpanjang sekarang' };
    const m = modal(`<div class="remind"><div class="bell">${icon('bell')}</div><h3>${t.h}</h3><p>${t.p}</p>
      <div class="col"><button class="btn primary block" data-go>${t.b}</button><button class="btn ghost block" data-close>Nanti aja</button></div></div>`, { cls: 'small' });
    m.el.querySelector('[data-go]').onclick = () => { m.close(); openCheckout(); };
    try {
      if (PT.S.account.notif && 'Notification' in window && Notification.permission === 'granted')
        new Notification(t.h, { body: t.p, icon: '/app/assets/icon-192.png', tag: 'bmpt-sub' });
    } catch (e) { /* mis. Android butuh service worker — pengingat in-app tetap jalan */ }
  }
  function checkReminder() {
    if (!Cloud.user || !PT.S.account) return;
    const s = PT.reminderDue();
    if (s) { PT.markReminded(); openReminder(s); }
  }

  /* ============================================================
     ACTIONS (event delegation)
     ============================================================ */
  const guard = fn => (...a) => { if (expired()) { openCheckout(); return; } return fn(...a); };
  const ACT = {
    'checkout': () => openCheckout(),
    'client-new': guard(() => openClientForm()),
    'client-edit': el => openClientForm(el.dataset.id),
    'report': guard(el => openReport(el.dataset.id)),
    'lift': el => openLift(el.dataset.id, el.dataset.name),
    'session': el => openSession(el.dataset.id),
    'measure-new': guard(el => openMeasure(el.dataset.id)),
    'measure-del': async el => { if (!(await confirmBox('Hapus pengukuran ini?', '', 'Hapus', true))) return; PT.removeMeasure(el.dataset.id); refresh(); },

    'log-leave': () => leaveLog(),
    'log-phdel': el => {
      const pose = el.dataset.pose, p = (D.photos || []).find(x => x.pose === pose); if (!p) return;
      if (!(D.origPhotos || []).includes(p.id)) Photos.remove(p.id);
      D.photos = D.photos.filter(x => x !== p); persistDraft(); paintPhotos();
    },
    'cex-edit': el => openCustomEx({ id: el.dataset.id }),
    'photo-view': el => openPhoto(el.dataset.cid, el.dataset.id),
    'cex-new': guard(() => openCustomEx({})),
    'log-save': () => saveLog(),
    'log-day': async el => {
      const c = PT.client(D.clientId), prog = PT.program(D.programId) || PT.program(c.programId); if (!prog) return;
      const i = +el.dataset.i, day = i >= 0 ? prog.days[i] : null;
      if ((day ? day.name : '') === D.dayName) return;
      if (hasData(D) && !(await confirmBox('Ganti latihan hari ini?', 'Set yang sudah diisi di sesi ini akan diganti.', 'Ganti'))) return;
      applyDay(D, prog, day);
      $$('.daypick .chip').forEach(b => b.classList.toggle('on', b === el));
      persistDraft(); paintLog();
    },
    'log-tick': el => {
      const ei = +el.dataset.e, ri = +el.dataset.r, e = D.exercises[ei], r = e.rows[ri];
      const row = el.closest('.set'), [ikg, ireps] = row.querySelectorAll('input');
      if (r.done) r.done = false;
      else {
        if (r.reps === '') r.reps = String(ireps.placeholder || '');
        if (!num(r.reps)) { toast('Isi reps dulu ya', 'err'); ireps.focus(); return; }
        if (r.kg === '' && ikg.placeholder) r.kg = ikg.placeholder;
        r.done = true;
      }
      ikg.value = r.kg; ireps.value = r.reps;
      row.classList.toggle('done', r.done);
      persistDraft(); paintSum();
    },
    'log-addset': el => { const ei = +el.dataset.e; D.exercises[ei].rows.push({ kg: '', reps: '', done: false }); persistDraft(); paintEx(ei); },
    'log-delset': el => { const ei = +el.dataset.e; if (D.exercises[ei].rows.length > 1) D.exercises[ei].rows.pop(); persistDraft(); paintEx(ei); },
    'log-delex': async el => {
      const ei = +el.dataset.e, e = D.exercises[ei];
      if (e.rows.some(r => r.done) && !(await confirmBox('Hapus gerakan ini?', `${esc(e.name)} dan set yang sudah diisi akan dihapus dari sesi.`, 'Hapus', true))) return;
      D.exercises.splice(ei, 1); persistDraft(); paintLog();
    },
    'log-addex': () => openPicker(name => {
      D.exercises.push({ name, target: null, rows: blankRows(3) });
      persistDraft(); paintLog();
      const last = $$('.exb').pop(); if (last) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }),

    'prog-new': guard(() => { location.hash = '#/program/baru'; }),
    'pday-add': () => { P.days.push({ id: PT.uid('d'), name: `Hari ${P.days.length + 1}`, exercises: [] }); paintPDays(); },
    'pday-del': async el => {
      const d = +el.dataset.d, day = P.days[d];
      if (day.exercises.length && !(await confirmBox('Hapus hari ini?', `${esc(day.name)} beserta ${day.exercises.length} gerakannya akan dihapus.`, 'Hapus', true))) return;
      P.days.splice(d, 1); paintPDays();
    },
    'pex-add': el => { const d = +el.dataset.d; openPicker(name => { P.days[d].exercises.push({ name, sets: 3, reps: '10' }); paintPDays(); }); },
    'pex-del': el => { P.days[+el.dataset.d].exercises.splice(+el.dataset.x, 1); paintPDays(); },
    'prog-save': guard(() => {
      const name = String(P.name || '').trim();
      if (!name) { toast('Kasih nama program dulu', 'err'); const f = $('[data-pf="name"]'); if (f) f.focus(); return; }
      const days = P.days.filter(d => d.exercises.length).map((d, i) => ({
        id: d.id, name: String(d.name || '').trim() || `Hari ${i + 1}`,
        exercises: d.exercises.map(e => ({ name: e.name, sets: Math.max(1, parseInt(e.sets, 10) || 3), reps: String(e.reps || '').trim() || '10' })),
      }));
      if (!days.length) { toast('Tambah minimal 1 gerakan', 'err'); return; }
      PT.saveProgram({ id: P.id, name, desc: String(P.desc || '').trim(), days });
      P = null; location.hash = '#/program'; toast('Program disimpan');
    }),
    'prog-del': async () => {
      const n = PT.programClients(P.id).length;
      if (!(await confirmBox('Hapus program?', n ? `${n} klien pakai program ini dan jadi tanpa program. Riwayat sesi tetap aman.` : 'Riwayat sesi klien tetap aman.', 'Hapus', true))) return;
      PT.removeProgram(P.id); P = null; location.hash = '#/program'; toast('Program dihapus');
    },

    'acc-edit': () => openAccountForm(),
    'backup': () => {
      const blob = new Blob([PT.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `bodimentor-pt-backup-${PT.today()}.json`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast('File backup diunduh');
    },
    'demo-del': async () => {
      if (!(await confirmBox('Hapus contoh klien?', 'Klien contoh beserta sesi & pengukurannya dihapus. Klien kamu sendiri aman.', 'Hapus', true))) return;
      PT.removeDemo(); refresh(); toast('Contoh klien dihapus');
    },
    'logout': async () => {
      if (!(await confirmBox('Keluar dari akun?', Cloud.enabled ? 'Data kamu tetap aman tersimpan di server.' : 'Data tetap tersimpan di perangkat ini.', 'Keluar'))) return;
      await pushNow();
      await Cloud.signOut();
      PT.onSave(null);
      location.hash = '#/masuk'; route();
    },
    'password': () => {
      const m = modal(`${mhead('Ganti password', esc(Cloud.user ? Cloud.user.email : ''))}
        <form class="mbody form" id="pwform" novalidate>${pwField('password', 'Password baru', 'new-password', 'minimal 8 karakter')}${pwField('password2', 'Ulangi password baru', 'new-password')}<div id="pwErr"></div></form>
        <div class="mfoot"><button class="btn" data-close>Batal</button><button class="btn primary" type="submit" form="pwform">Simpan</button></div>`);
      $('#pwform', m.el).onsubmit = async e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target)), err = t => { $('#pwErr', m.el).innerHTML = `<div class="note">${icon('alert')}<p>${esc(t)}</p></div>`; };
        if (String(d.password || '').length < 8) return err('Password minimal 8 karakter.');
        if (d.password !== d.password2) return err('Kedua password belum sama.');
        try { await Cloud.setPassword(d.password); m.close(); toast('Password diganti'); } catch (x) { err(x.message); }
      };
    },
  };

  document.addEventListener('click', e => {
    const eye = e.target.closest('[data-eye]');
    if (eye) { const i = eye.parentElement.querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; eye.classList.toggle('on', i.type === 'text'); return; }
    const g = e.target.closest('[data-guard]');
    if (g && expired()) { e.preventDefault(); e.stopPropagation(); openCheckout(); return; }
    const pk = e.target.closest('.pick .chip');
    if (pk) {
      const box = pk.closest('.pick');
      $$('.chip', box).forEach(b => b.classList.toggle('on', b === pk));
      $('input[type=hidden]', box).value = pk.dataset.v;
      return;
    }
    const f = e.target.closest('[data-filter]');
    if (f) { UI.filter = f.dataset.filter; $$('#cfilter .chip').forEach(x => x.classList.toggle('on', x === f)); paintClientList(); return; }
    const ct = e.target.closest('[data-ctab]');
    if (ct) {
      UI.ctab[ct.dataset.id] = ct.dataset.ctab;
      $$('#ctabs button').forEach(b => b.classList.toggle('on', b.dataset.ctab === ct.dataset.ctab));
      paintCTab(PT.client(ct.dataset.id));
      if (!ct.closest('#ctabs')) $('#ctabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const sim = e.target.closest('[data-sim]');
    if (sim) { PT.simulate(sim.dataset.sim); refresh(); checkReminder(); toast('Status langganan diubah (mode uji)'); return; }
    const a = e.target.closest('[data-act]');
    if (a && ACT[a.dataset.act]) { e.preventDefault(); ACT[a.dataset.act](a, e); }
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.lf && D) {
      const f = t.dataset.lf;
      if (f === 'date') D.date = t.value || PT.today();
      else if (f === 'notes') D.notes = t.value;
      else {
        const r = D.exercises[+t.dataset.e].rows[+t.dataset.r];
        r[f] = t.value.replace(/[^\d.,]/g, '');
        if (f === 'reps') { r.done = num(r.reps) > 0; t.closest('.set').classList.toggle('done', r.done); }
      }
      persistDraft(); paintSum();
      return;
    }
    if (t.dataset.pf && P) {
      const f = t.dataset.pf, d = P.days[+t.dataset.d];
      if (f === 'name') P.name = t.value;
      else if (f === 'desc') P.desc = t.value;
      else if (f === 'dayname') d.name = t.value;
      else if (f === 'sets') d.exercises[+t.dataset.x].sets = t.value.replace(/\D/g, '');
      else if (f === 'reps') d.exercises[+t.dataset.x].reps = t.value;
      return;
    }
    if (t.id === 'cq') { UI.q = t.value; paintClientList(); return; }
    if (t.id === 'lq') { UI.liftQ = t.value; const c = PT.client(t.dataset.cid); $('#llist').innerHTML = liftList(c, PT.lifts(c.id)); }
  });

  document.addEventListener('change', async e => {
    const t = e.target;
    if (t.dataset.lph && D && t.files && t.files[0]) {
      const pose = t.dataset.lph, file = t.files[0];
      PH_BUSY.add(pose); paintPhotos();
      try {
        const id = await Photos.add(file);
        if (!D) { Photos.remove(id); PH_BUSY.delete(pose); return; }   // keburu keluar dari layar sesi
        const old = (D.photos || []).find(x => x.pose === pose);
        if (old && !(D.origPhotos || []).includes(old.id)) Photos.remove(old.id);
        D.photos = (D.photos || []).filter(x => x.pose !== pose).concat([{ id, pose }]);
        persistDraft();
      } catch (err) { toast(err.message, 'err'); }
      PH_BUSY.delete(pose); paintPhotos();
      return;
    }
    if (t.id === 'notifT') {
      if (!t.checked) { PT.updateAccount({ notif: false }); toast('Notifikasi dimatikan'); return; }
      if (!('Notification' in window)) { t.checked = false; toast('Browser ini belum mendukung notifikasi', 'err'); return; }
      const p = await Notification.requestPermission();
      if (p !== 'granted') { t.checked = false; toast('Izin notifikasi ditolak di browser', 'err'); return; }
      PT.updateAccount({ notif: true }); toast('Notifikasi pengingat aktif');
      try { new Notification('Pengingat Bodimentor PT aktif', { body: 'Kamu dikabari sebelum langganan habis.', icon: '/app/assets/icon-192.png' }); } catch (_) { }
    }
    if (t.id === 'restoreF' && t.files && t.files[0]) {
      const txt = await t.files[0].text();
      t.value = '';
      if (!(await confirmBox('Pulihkan data dari backup?', 'Data di perangkat ini akan diganti dengan isi file backup.', 'Pulihkan'))) return;
      try { PT.importJSON(txt); location.hash = '#/klien'; route(); toast('Data berhasil dipulihkan'); }
      catch (err) { toast('File backup tidak valid', 'err'); }
    }
  });

  window.addEventListener('hashchange', () => route());
  // Balik dari app bank / e-wallet → langsung cek status bayar
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    if (!Cloud.user) return;
    if (PAY && PAY.slug) checkPay(false); else watchPending();
    checkReminder();
  });
  // HP Android RAM kecil: matikan efek blur biar scroll tetap mulus
  if (/Android/i.test(navigator.userAgent) && (navigator.deviceMemory || 8) <= 4) document.documentElement.classList.add('lite');
  // Simpan ke server sebelum app ditutup / pindah ke app lain, dan saat sinyal kembali
  document.addEventListener('visibilitychange', () => { if (document.hidden) pushNow(); });
  window.addEventListener('pagehide', () => pushNow());
  window.addEventListener('online', () => { if (Cloud.user) { dirty = true; pushNow(); Cloud.flushPhotos(); } });
  setInterval(() => { if (!document.hidden && !PAY && Cloud.user) watchPending(); }, 20000);
  (async function boot() {
    $('#app').innerHTML = '<div class="boot"><img src="/app/assets/logo-mark.png" alt=""><div class="spinner"></div></div>';
    let st = { user: null };
    try { st = await Cloud.init(); } catch (e) { st = { user: null, error: e.message }; }
    if (st.user) { try { await openAccount(st.user); } catch (e) { console.error(e); } }
    READY = true;
    if (st.recovery) location.replace('#/reset');
    route();
    if (st.error) toast(st.error, 'err');
    if (Cloud.user) setTimeout(() => { watchPending(); checkReminder(); }, 800);
  })();
})();
