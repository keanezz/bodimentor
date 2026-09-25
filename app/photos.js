/* ============================================================
   BODIMENTOR PT — foto (gerakan buatan sendiri & progres klien)
   Foto dikompres (maks 1280px, JPEG) → disimpan di IndexedDB (offline)
   → ikut diunggah ke Cloud kalau login server aktif.
   Di data aplikasi cukup disimpan ID-nya.
   ============================================================ */
window.Photos = (function () {
  'use strict';
  const DB = 'bmpt-photos', STORE = 'photos';
  let dbp = null;
  const urls = new Map();   // id → objectURL (cache per sesi)

  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function tx(mode, fn) {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction(STORE, mode), s = t.objectStore(STORE);
      const out = fn(s);
      t.oncomplete = () => res(out && 'result' in out ? out.result : undefined);
      t.onerror = () => rej(t.error);
    });
  }
  const getLocal = id => tx('readonly', s => s.get(id));
  const putLocal = (id, blob) => tx('readwrite', s => s.put(blob, id));
  const delLocal = id => tx('readwrite', s => s.delete(id));

  // Perkecil & kompres di HP sebelum disimpan (foto kamera 3–8 MB → ±150–300 KB)
  function compress(file, max = 1280, q = 0.82) {
    return new Promise((res, rej) => {
      const img = new Image(), u = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(u);
        cv.toBlob(b => b ? res(b) : rej(new Error('Gagal memproses foto')), 'image/jpeg', q);
      };
      img.onerror = () => { URL.revokeObjectURL(u); rej(new Error('File bukan gambar yang didukung')); };
      img.src = u;
    });
  }
  const newId = () => 'ph_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  async function add(file) {
    const blob = await compress(file);
    const id = newId();
    await putLocal(id, blob);
    if (window.Cloud && Cloud.enabled) Cloud.uploadPhoto(id, blob).catch(e => console.warn('upload foto ditunda', e));
    return id;
  }
  async function blob(id) {
    if (!id) return null;
    let b = await getLocal(id).catch(() => null);
    if (!b && window.Cloud && Cloud.enabled) {
      b = await Cloud.downloadPhoto(id).catch(() => null);
      if (b) putLocal(id, b).catch(() => { });
    }
    return b || null;
  }
  async function url(id) {
    if (!id) return '';
    if (urls.has(id)) return urls.get(id);
    const b = await blob(id);
    if (!b) return '';
    const u = URL.createObjectURL(b); urls.set(id, u);
    return u;
  }
  async function dataURL(id) {
    const b = await blob(id);
    if (!b) return null;
    return new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(b); });
  }
  async function remove(id) {
    if (!id) return;
    if (urls.has(id)) { URL.revokeObjectURL(urls.get(id)); urls.delete(id); }
    await delLocal(id).catch(() => { });
    if (window.Cloud && Cloud.enabled) Cloud.deletePhoto(id).catch(() => { });
  }
  // Isi <img data-photo="id"> yang ada di dalam root (dipanggil setelah render)
  function hydrate(root) {
    (root || document).querySelectorAll('img[data-photo]:not([src])').forEach(async img => {
      const u = await url(img.dataset.photo);
      if (u) img.src = u; else img.closest('.ph-wrap, .thumb')?.classList.add('ph-missing');
    });
  }

  return { add, blob, url, dataURL, remove, hydrate, compress };
})();
