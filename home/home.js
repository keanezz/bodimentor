/* Website Bodimentor — header saat scroll, reveal, menu Masuk, dan status login Coach App. */
(() => {
  const hdr = document.getElementById('hdr');
  const onScroll = () => hdr.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(el => io.observe(el));
  } else items.forEach(el => el.classList.add('in'));

  // Sesi login tersimpan di origin yang sama (app/) — kalau ada, header langsung ke aplikasi.
  let signedIn = false;
  try {
    const sb = JSON.parse(localStorage.getItem('bmpt-auth') || 'null');
    const loc = JSON.parse(localStorage.getItem('bmpt.local-auth') || 'null');
    signedIn = !!((sb && (sb.access_token || (sb.currentSession && sb.currentSession.access_token))) || (loc && loc.session));
  } catch (e) { }
  const coach = document.getElementById('navCoach');
  if (signedIn && coach) {
    coach.href = '/app';
    const t = coach.querySelector('small') || coach.querySelector('span');
    t.textContent = coach.querySelector('small') ? 'Kamu sudah masuk — buka aplikasi' : 'Buka aplikasi';
  }

  // Menu Masuk (website utama): tutup saat klik di luar / Esc / scroll
  const dd = document.getElementById('loginMenu');
  if (dd) {
    document.addEventListener('click', e => { if (dd.open && !dd.contains(e.target)) dd.open = false; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') dd.open = false; });
    addEventListener('scroll', () => { if (dd.open && scrollY > 40) dd.open = false; }, { passive: true });
  }
})();
