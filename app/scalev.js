/* ============================================================
   BODIMENTOR PT — pembayaran langganan via Scalev Storefront API
   Dipanggil langsung dari browser (sesuai aturan Scalev: jangan di-proxy).
   Kunci di bawah adalah *publishable* storefront key — aman ada di frontend.
   Produk: bundle "Bodimentor PT — Langganan Bulanan" (Rp 99.000) di toko Anti Ribet.
   Origin app wajib didaftarkan di Scalev (Storefront API → allowed origins).
   ============================================================ */
window.Scalev = (function () {
  'use strict';

  const CFG = {
    api: 'https://api.scalev.com/v3/stores/store_3NIAlByo7AJA9YE6KRkys9E2',
    key: 'sfpk_7G6rnApn8qurgRAXph3IGxQ54u58xSfj4hdAPhVqiCBwdNgVljJQGJKoCdUQ2E3j',
    item: { type: 'bundle_price_option', bundle_price_option_id: 42698, quantity: 1 },
  };

  async function call(path, opt = {}) {
    const headers = { Accept: 'application/json', 'X-Scalev-Storefront-Api-Key': CFG.key };
    if (opt.body) headers['Content-Type'] = 'application/json';
    let res;
    try {
      res = await fetch(CFG.api + path, { method: opt.method || 'GET', credentials: 'omit', headers, body: opt.body ? JSON.stringify(opt.body) : undefined });
    } catch (e) {
      const err = new Error('Gak bisa terhubung ke server pembayaran. Cek koneksi internet.'); err.network = true; throw err;
    }
    const txt = await res.text();
    let data = null; try { data = txt ? JSON.parse(txt) : null; } catch (e) { /* non-JSON */ }
    if (!res.ok) {
      const raw = data && (data.error || data.detail || data.message || (data.errors && JSON.stringify(data.errors)));
      const err = new Error(raw || `Server pembayaran error (${res.status})`);
      err.status = res.status; err.duplicate = /duplicate/i.test(String(raw || ''));
      throw err;
    }
    return data;
  }

  // Cari nilai pertama dari daftar key di objek bersarang (format tiap provider beda: DOKU, Xendit, dll)
  function find(obj, keys, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 6) return null;
    for (const k of keys) if (obj[k] != null && obj[k] !== '') return obj[k];
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') { const r = find(v, keys, depth + 1); if (r != null) return r; }
    }
    return null;
  }

  // Ringkas order Scalev jadi data yang dibutuhkan layar bayar
  function view(o) {
    const pg = o.pg_payment_info || {};
    const ps = String(o.payment_status || '').toLowerCase();
    const st = String(o.status || '').toLowerCase();
    const paid = ps === 'paid' || ps === 'settled' || st === 'completed';
    const expiresAt = o.payment_expiration_at || pg.expired_at || null;
    const timeUp = expiresAt && new Date(expiresAt).getTime() < Date.now();
    const va = find(pg, ['virtual_account_no', 'virtualAccountNo', 'virtual_account_number', 'va_number', 'payment_code']);
    return {
      slug: o.secret_slug, orderId: o.order_id, method: o.payment_method, total: Number(o.gross_revenue) || 0,
      paid, dead: !paid && (st === 'canceled' || st === 'cancelled' || ps === 'expired' || !!timeUp),
      qr: find(pg, ['qr_content', 'qr_string', 'qrString']),
      va: va ? String(va).replace(/\s+/g, '') : (o.payment_account_number || null),
      holder: find(pg, ['virtual_account_name', 'virtualAccountName', 'customer_name']) || o.payment_account_holder || null,
      url: find(pg, ['invoice_url', 'redirect_url', 'checkout_url', 'how_to_pay_page']),
      hostedUrl: o.public_order_url || o.payment_url || null,
      expiresAt,
    };
  }

  const methods = () => call('/public/payment-methods').then(r => (r && r.data || []).filter(m => m.enabled && !m.requires_redirect));
  const create = buyer => call('/public/checkout', { method: 'POST', body: Object.assign({ items: [CFG.item] }, buyer) });
  const pay = slug => call(`/public/orders/${encodeURIComponent(slug)}/payment`, { method: 'POST', body: {} });
  const order = slug => call(`/public/orders/${encodeURIComponent(slug)}`);

  return { CFG, methods, create, pay, order, view };
})();
