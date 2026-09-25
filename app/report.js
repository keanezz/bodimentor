/* ============================================================
   BODIMENTOR PT — laporan progres (PDF) + kirim ke WhatsApp
   Butuh jsPDF (window.jspdf) — dimuat dari CDN di index.html
   ============================================================ */
window.Report = (function () {
  'use strict';

  const C = {
    dark: [10, 14, 19], dark2: [24, 34, 45], blue: [45, 180, 223], teal: [48, 161, 159], green: [110, 200, 39],
    ink: [22, 30, 41], mute: [110, 124, 140], line: [226, 232, 239], soft: [243, 246, 249], tint: [231, 246, 243],
    rose: [214, 72, 72], white: [255, 255, 255], barOld: [176, 214, 226],
  };

  // Logo diubah ke dataURL kecil sekali di awal, biar pembuatan PDF sinkron
  // (navigator.share wajib dipanggil langsung dari tap user).
  let LOGO = null;
  (function preload() {
    const img = new Image();
    img.onload = () => {
      const w = 300, h = Math.round(img.height * w / img.width);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      LOGO = { data: cv.toDataURL('image/png'), ratio: h / w };
    };
    img.src = '/app/assets/logo-mark.png';
  })();

  const fmt = (n, d = 0) => Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: d });
  const f1 = n => fmt(n, 1);
  const setTxt = x => x ? (x[0] ? `${f1(x[0])} kg × ${x[1]}` : `BW × ${x[1]}`) : '–';
  const sign = n => (n > 0 ? '+' : n < 0 ? '-' : '') + f1(Math.abs(n));
  const firstName = s => String(s || '').trim().split(/\s+/)[0] || '';
  function normPhone(p) {
    let d = String(p || '').replace(/\D/g, '');
    if (d.startsWith('0')) d = '62' + d.slice(1);
    else if (d.startsWith('8')) d = '62' + d;
    return d;
  }
  // arah "bagus" untuk berat badan sesuai tujuan klien
  const weightDir = goal => /turun/i.test(goal || '') ? -1 : /naik/i.test(goal || '') ? 1 : 0;

  /* ---------- angka-angka laporan ---------- */
  function summary(cid, key) {
    const c = PT.client(cid);
    const first = PT.firstMonth(cid);
    const keys = [key];
    while (keys.length < 4 && PT.prevMonth(keys[0]) >= first) keys.unshift(PT.prevMonth(keys[0]));
    const months = keys.map(k => PT.monthStats(cid, k));
    const cur = months[months.length - 1];
    const prevKey = PT.prevMonth(key);
    const prev = PT.prevStats(cid, key);          // bulan berjalan: periode yang sama bulan lalu
    const partial = PT.partialDay(key), vs = PT.vsLabel(key);
    const bestOf = arr => arr.reduce((b, h) => PT.better(h.best, b) ? h.best : b, null);

    const lifts = PT.lifts(cid).filter(L => PT.monthKey(L.first.date) <= key);
    const top = lifts.slice().sort((a, b) => b.count - a.count).slice(0, 8).map(L => {
      const hist = L.history.filter(h => PT.monthKey(h.date) <= key);
      return {
        name: L.name, first: hist[0].best, firstDate: hist[0].date,
        prev: bestOf(hist.filter(h => PT.monthKey(h.date) === prevKey)),
        cur: bestOf(hist.filter(h => PT.monthKey(h.date) === key)),
      };
    });
    // Indeks kekuatan: rata-rata % perubahan estimasi 1RM gerakan utama (bulan ini vs bulan lalu / awal)
    const cmp = top.filter(t => t.cur && t.cur[0] > 0).slice(0, 5).map(t => {
      const base = t.prev || t.first; return (PT.e1rm(t.cur) - PT.e1rm(base)) / PT.e1rm(base) * 100;
    });
    const strength = cmp.length ? cmp.reduce((a, b) => a + b, 0) / cmp.length : null;
    const prs = lifts.filter(L => {
      const before = L.history.filter(h => PT.monthKey(h.date) < key), during = L.history.filter(h => PT.monthKey(h.date) === key);
      if (!before.length || !during.length) return false;
      return bestOf(during)[0] > bestOf(before)[0];
    }).map(L => L.name);

    const ms = PT.measuresOf(cid).filter(m => PT.monthKey(m.date) <= key);
    const firstM = ms[0] || null, curM = PT.measureAt(cid, key), prevM = PT.measureAt(cid, prevKey);
    let series = ms.filter(m => m.date >= keys[0] + '-01');
    if (series.length < 2) series = ms;

    const R = { c, key, months, cur, prev, partial, vs, top, strength, prs, firstM, curM, prevM, series };
    R.highlights = highlights(R);
    return R;
  }

  function highlights(R) {
    const out = [], { cur, prev } = R;
    const when = R.partial ? `sejauh bulan ini (1–${R.partial} ${PT.monthLabel(R.key).split(' ')[0]})` : 'bulan ini';
    const base = R.partial ? 'periode yang sama bulan lalu' : 'bulan lalu';
    if (cur.sessions) {
      const d = cur.sessions - prev.sessions;
      out.push(`Latihan ${cur.sessions}× ${when}` + (prev.sessions
        ? (d > 0 ? ` — ${d} sesi lebih banyak dari ${base}.` : d < 0 ? ` — ${-d} sesi lebih sedikit dari ${base}.` : ` — sama konsistennya dengan ${base}.`)
        : '.'));
    }
    if (prev.volume && cur.volume) {
      const p = (cur.volume - prev.volume) / prev.volume * 100;
      if (Math.abs(p) >= 1) out.push(`Total beban yang diangkat ${p > 0 ? 'naik' : 'turun'} ${fmt(Math.abs(p))}% dibanding ${base} (${fmt(cur.volume)} kg).`);
    }
    const g = R.top.filter(t => t.cur && t.cur[0] > t.first[0]).sort((a, b) => (b.cur[0] - b.first[0]) - (a.cur[0] - a.first[0]))[0];
    if (g) out.push(`${g.name}: dari ${f1(g.first[0])} kg jadi ${f1(g.cur[0])} kg sejak mulai (+${f1(g.cur[0] - g.first[0])} kg).`);
    if (R.prs.length) out.push(`${R.prs.length} rekor pribadi (PR) baru: ${R.prs.slice(0, 3).join(', ')}${R.prs.length > 3 ? ', dll' : ''}.`);
    if (R.firstM && R.curM && R.curM.date !== R.firstM.date) {
      const d = R.curM.weight - R.firstM.weight;
      if (Math.abs(d) >= 0.2) out.push(`Berat badan ${d < 0 ? 'turun' : 'naik'} ${f1(Math.abs(d))} kg sejak ${PT.fmtDate(R.firstM.date)} (${f1(R.firstM.weight)} kg jadi ${f1(R.curM.weight)} kg).`);
      if (R.firstM.bodyFat != null && R.curM.bodyFat != null) {
        const b = R.curM.bodyFat - R.firstM.bodyFat;
        if (Math.abs(b) >= 0.3) out.push(`Body fat ${b < 0 ? 'turun' : 'naik'} ${f1(Math.abs(b))}% sejak mulai.`);
      }
    }
    if (!out.length) out.push('Data bulan ini masih sedikit — lanjut catat tiap sesi biar progresnya kelihatan jelas.');
    return out.slice(0, 5);
  }

  function waText(R) {
    const A = PT.S.account, c = R.c;
    const lines = [`Halo ${firstName(c.name)}! Ini laporan progres latihan kamu bulan ${PT.monthLabel(R.key, true)} 💪`, ''];
    R.highlights.slice(0, 3).forEach(h => lines.push('• ' + h));
    lines.push('', 'Detail lengkapnya ada di PDF ya. Tetap semangat!', `— Coach ${firstName(A.name)}${A.gym ? ' · ' + A.gym : ''}`);
    return lines.join('\n');
  }

  /* ---------- foto before–after (disiapkan async, dipakai build sinkron) ---------- */
  const PHOTO = {};
  const weightOn = (cid, date) => { const ms = PT.measuresOf(cid).filter(m => m.date <= date); return ms.length ? ms[ms.length - 1].weight : null; };
  async function prepare(cid, key) {
    const ba = PT.beforeAfter(cid, key + '-31');
    let res = null;
    if (ba && window.Photos) {
      const mids = ba.all.slice(1, -1);
      const pick = mids.length <= 3 ? mids : [0, 1, 2].map(i => mids[Math.round(i * (mids.length - 1) / 2)]);
      const list = [ba.before].concat(pick, [ba.after]);
      const data = await Promise.all(list.map(p => Photos.dataURL(p.id).catch(() => null)));
      const pack = (p, d) => d ? Object.assign({}, p, { data: d, weight: weightOn(cid, p.date) }) : null;
      res = { before: pack(ba.before, data[0]), after: pack(ba.after, data[data.length - 1]), mids: pick.map((p, i) => pack(p, data[i + 1])).filter(Boolean) };
      if (!res.before || !res.after) res = null;
    }
    PHOTO[cid + key] = res;
    return res;
  }

  /* ---------- PDF ---------- */
  function build(cid, key, notes) {
    const { jsPDF } = window.jspdf;
    const R = summary(cid, key), c = R.c, A = PT.S.account;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const W = 210, M = 14, CW = W - 2 * M;
    const fill = x => doc.setFillColor(x[0], x[1], x[2]);
    const draw = x => doc.setDrawColor(x[0], x[1], x[2]);
    const ink = x => doc.setTextColor(x[0], x[1], x[2]);
    const font = (st, sz) => { doc.setFont('helvetica', st); doc.setFontSize(sz); };
    const period = PT.monthLabel(key, true);
    const BA = PHOTO[cid + key] || null;
    const TOTAL = BA ? 3 : 2;

    function stripe(y, h) {
      const n = 70;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1), a = t < 0.5 ? C.blue : C.teal, b = t < 0.5 ? C.teal : C.green, u = t < 0.5 ? t * 2 : (t - 0.5) * 2;
        doc.setFillColor(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u);
        doc.rect(W * i / n, y, W / n + 0.3, h, 'F');
      }
    }
    function brand(x, y, logoW) {
      if (LOGO) doc.addImage(LOGO.data, 'PNG', x, y, logoW, logoW * LOGO.ratio);
      const tx = x + (LOGO ? logoW + 3 : 0);
      font('bold', 10.5); ink(C.white); doc.text('BODIMENTOR', tx, y + logoW * 0.3);
      ink(C.green); doc.text('PT', tx + doc.getTextWidth('BODIMENTOR') + 1.4, y + logoW * 0.3);
      return tx;
    }
    function footer(page) {
      draw(C.line); doc.setLineWidth(0.3); doc.line(M, 284, W - M, 284);
      font('normal', 7.5); ink(C.mute);
      doc.text(`Dibuat dengan Bodimentor PT  ·  Coach ${A.name}${A.gym ? ' · ' + A.gym : ''}`, M, 289);
      doc.text(`Halaman ${page} / ${TOTAL}`, W - M, 289, { align: 'right' });
    }
    function title(txt, y, sub) {
      fill(C.teal); doc.rect(M, y - 3.8, 1.4, 5, 'F');
      font('bold', 12.5); ink(C.ink); doc.text(txt, M + 4, y);
      if (sub) { font('normal', 8); ink(C.mute); doc.text(sub, W - M, y, { align: 'right' }); }
    }

    /* ===== HALAMAN 1 ===== */
    fill(C.dark); doc.rect(0, 0, W, 50, 'F');
    const tx = brand(M, 10, 20);
    font('normal', 8.5); ink([150, 165, 180]); doc.text('Laporan progres latihan', tx, 10 + 20 * 0.3 + 5);
    font('bold', 7.5); ink(C.blue); doc.text('PERIODE', W - M, 14, { align: 'right' });
    font('bold', 12); ink(C.white); doc.text(period, W - M, 20.5, { align: 'right' });
    font('bold', 22); ink(C.white); doc.text(c.name, M, 39);
    font('normal', 9); ink([150, 165, 180]); doc.text(`Coach ${A.name}${A.gym ? '  ·  ' + A.gym : ''}`, M, 45.5);
    stripe(50, 1.6);

    // Profil
    let y = 57;
    fill(C.soft); doc.roundedRect(M, y, CW, 22, 2.5, 2.5, 'F');
    const age = PT.age(c), prog = PT.program(c.programId);
    const prof = [
      ['UMUR', age ? age + ' tahun' : '–'], ['JENIS KELAMIN', c.gender === 'P' ? 'Perempuan' : c.gender === 'L' ? 'Laki-laki' : '–'],
      ['TINGGI', c.heightCm ? c.heightCm + ' cm' : '–'], ['TUJUAN', c.goal || '–'],
      ['PROGRAM', prog ? prog.name : '–'], ['MULAI LATIHAN', c.startDate ? PT.fmtDate(c.startDate) : '–'],
    ];
    const pw = CW / prof.length;
    prof.forEach(([l, v], i) => {
      const x = M + 4 + i * pw;
      font('bold', 6.5); ink(C.mute); doc.text(l, x, y + 7);
      font('bold', 8.8); ink(C.ink); doc.text(doc.splitTextToSize(v, pw - 5).slice(0, 2), x, y + 12.5);
    });

    // KPI
    const curMon = PT.monthLabel(key).split(' ')[0];
    y = 90; title(R.partial ? `Ringkasan bulan ini (s/d ${R.partial} ${curMon})` : 'Ringkasan bulan ini', y,
      R.prev.sessions ? `dibanding ${R.partial ? 'periode yang sama bulan lalu' : PT.monthLabel(PT.prevMonth(key))}` : '');
    const prevLbl = R.vs;
    const dSes = R.cur.sessions - R.prev.sessions;
    const dVol = R.prev.volume ? (R.cur.volume - R.prev.volume) / R.prev.volume * 100 : null;
    const wNow = R.curM ? R.curM.weight : null;
    const dW = R.curM && R.prevM && R.prevM.date !== R.curM.date ? R.curM.weight - R.prevM.weight : null;
    const wDir = weightDir(c.goal);
    const tone = (v, dir = 1) => v == null || Math.abs(v) < 0.05 || !dir ? C.mute : (v * dir > 0 ? C.green : C.rose);
    const kpis = [
      ['SESI LATIHAN', String(R.cur.sessions), R.prev.sessions || R.cur.sessions ? `${dSes > 0 ? '+' : ''}${dSes} vs ${prevLbl}` : 'belum ada sesi', tone(dSes)],
      ['TOTAL VOLUME', fmt(R.cur.volume) + ' kg', dVol != null ? `${dVol > 0 ? '+' : ''}${fmt(dVol)}% vs ${prevLbl}` : 'total kg × reps', tone(dVol)],
      ['BERAT BADAN', wNow != null ? f1(wNow) + ' kg' : '–', dW != null ? `${sign(dW)} kg vs ${PT.monthLabel(PT.prevMonth(key)).split(' ')[0]}` : 'belum ada pembanding', tone(dW, wDir)],
      ['KEKUATAN', R.strength != null ? (R.strength > 0 ? '+' : '') + f1(R.strength) + '%' : '–', 'rata-rata gerakan utama', tone(R.strength)],
    ];
    const kw = (CW - 3 * 4) / 4;
    kpis.forEach(([l, v, d, col], i) => {
      const x = M + i * (kw + 4), ky = y + 5;
      fill(C.soft); doc.roundedRect(x, ky, kw, 30, 2.5, 2.5, 'F');
      fill(col === C.mute ? C.line : col); doc.rect(x, ky + 4, 1.1, 22, 'F');
      font('bold', 6.8); ink(C.mute); doc.text(l, x + 4.5, ky + 7.5);
      font('bold', v.length > 9 ? 14 : 17); ink(C.ink); doc.text(v, x + 4.5, ky + 18);
      font('bold', 7.8); ink(col); doc.text(d, x + 4.5, ky + 25.5);
    });

    // Tabel perbandingan bulanan
    y = 138; title('Perbandingan bulanan', y);
    const Ms = R.months, n = Ms.length;
    const labW = 54, chW = n > 1 ? 30 : 0, colW = (CW - labW - chW) / n;
    // kolom terakhir = perubahan vs bulan lalu. Angka latihan (c) pakai basis periode yang sama
    // kalau bulan berjalan; angka tubuh (b) pakai ukuran terakhir bulan lalu.
    const rows = [
      ['Sesi latihan', m => m.sessions, v => fmt(v), 1, 'c'],
      ['Total volume (kg)', m => m.volume, v => fmt(v), 1, 'c'],
      ['Rata-rata volume / sesi', m => m.avgVol, v => fmt(v), 1, 'c'],
      ['Total set', m => m.sets, v => fmt(v), 1, 'c'],
      ['Berat badan (kg)', m => m.weight, v => f1(v), wDir, 'b'],
      ['Body fat (%)', m => m.bodyFat, v => f1(v), -1, 'b'],
      ['Lingkar pinggang (cm)', m => m.waist, v => f1(v), wDir === 1 ? 0 : -1, 'b'],
    ];
    let ty = y + 4;
    const rh = 8;
    fill(C.dark2); doc.roundedRect(M, ty, CW, rh, 1.5, 1.5, 'F');
    font('bold', 7.8); ink(C.white);
    doc.text('METRIK', M + 4, ty + 5.3);
    Ms.forEach((m, i) => doc.text(i === n - 1 && R.partial ? `${curMon.toUpperCase()} 1–${R.partial}` : m.label.toUpperCase(), M + labW + colW * i + colW / 2, ty + 5.3, { align: 'center' }));
    if (chW) doc.text('VS BLN LALU', M + CW - chW / 2, ty + 5.3, { align: 'center' });
    ty += rh;
    // highlight kolom bulan laporan
    fill(C.tint); doc.rect(M + labW + colW * (n - 1), ty, colW, rh * rows.length, 'F');
    rows.forEach(([lab, get, fm, dir, kind], ri) => {
      const ry = ty + ri * rh;
      if (ri % 2 === 1) { fill(C.soft); doc.rect(M, ry, labW, rh, 'F'); if (n > 1) doc.rect(M + labW, ry, colW * (n - 1), rh, 'F'); if (chW) doc.rect(M + CW - chW, ry, chW, rh, 'F'); }
      font('normal', 8.6); ink(C.ink); doc.text(lab, M + 4, ry + 5.4);
      const vals = Ms.map(get);
      vals.forEach((v, i) => {
        font(i === n - 1 ? 'bold' : 'normal', 8.6); ink(v == null ? C.mute : C.ink);
        doc.text(v == null ? '–' : fm(v), M + labW + colW * i + colW / 2, ry + 5.4, { align: 'center' });
      });
      if (chW) {
        const a = kind === 'c' ? get(R.prev) : vals[n - 2], b = vals[n - 1];
        let txt = '–', col = C.mute;
        if (a != null && b != null) {
          const d = b - a;
          txt = (d > 0 ? '+' : d < 0 ? '-' : '') + fm(Math.abs(d));
          col = tone(d, dir);
        }
        font('bold', 8.6); ink(col); doc.text(txt, M + CW - chW / 2, ry + 5.4, { align: 'center' });
      }
    });
    draw(C.line); doc.setLineWidth(0.3); doc.line(M, ty + rows.length * rh, W - M, ty + rows.length * rh);
    y = ty + rows.length * rh;
    if (R.partial && chW) {
      font('normal', 7); ink(C.mute);
      doc.text(`${curMon} 1–${R.partial} = data sampai laporan dibuat. "Vs bln lalu" untuk angka latihan dibanding periode yang sama (${R.vs}); angka tubuh dibanding ukuran terakhir ${PT.monthLabel(PT.prevMonth(key)).split(' ')[0]}.`, M, y + 4.5);
      y += 4;
    }

    // Grafik
    y += 9;
    const gw = (CW - 6) / 2, gh = 283 - 5 - y;
    lineBox(M, y, gw, gh);
    barBox(M + gw + 6, y, gw, gh);
    footer(1);

    /* ===== HALAMAN 2 ===== */
    doc.addPage();
    fill(C.dark); doc.rect(0, 0, W, 24, 'F');
    brand(M, 7, 14);
    font('bold', 10); ink(C.white); doc.text(c.name, W - M, 11.5, { align: 'right' });
    font('normal', 8.5); ink([150, 165, 180]); doc.text(period, W - M, 17, { align: 'right' });
    stripe(24, 1.2);

    y = 37; title('Progres kekuatan', y, 'set terberat tiap gerakan');
    const cols = [['GERAKAN', 62], ['AWAL', 29], ['BULAN LALU', 29], ['BULAN INI', 29], ['PERUBAHAN', CW - 62 - 87]];
    ty = y + 4;
    fill(C.dark2); doc.roundedRect(M, ty, CW, rh, 1.5, 1.5, 'F');
    font('bold', 7.6); ink(C.white);
    let cx = M;
    cols.forEach(([l, w], i) => { doc.text(l, i ? cx + w / 2 : cx + 4, ty + 5.3, i ? { align: 'center' } : undefined); cx += w; });
    ty += rh;
    const lrh = 9.5;
    if (!R.top.length) {
      font('normal', 9); ink(C.mute); doc.text('Belum ada data beban yang tercatat.', M + 4, ty + 7); ty += lrh;
    }
    R.top.forEach((t, i) => {
      const ry = ty + i * lrh;
      if (i % 2 === 1) { fill(C.soft); doc.rect(M, ry, CW, lrh, 'F'); }
      cx = M;
      font('bold', 8.6); ink(C.ink); doc.text(doc.splitTextToSize(t.name, 58)[0], cx + 4, ry + 4.6);
      font('normal', 7); ink(C.mute); doc.text('sejak ' + PT.fmtDate(t.firstDate), cx + 4, ry + 8);
      cx += 62;
      [t.first, t.prev, t.cur].forEach((v, j) => {
        font(j === 2 ? 'bold' : 'normal', 8.4); ink(v ? C.ink : C.mute);
        doc.text(v ? setTxt(v) : (j === 2 ? 'belum dilatih' : '–'), cx + 14.5, ry + 6, { align: 'center' });
        cx += 29;
      });
      let txt = '–', col = C.mute;
      if (t.cur) {
        if (t.cur[0] > 0 && t.first[0] > 0) {
          const d = t.cur[0] - t.first[0], p = d / t.first[0] * 100;
          txt = d ? `${sign(d)} kg (${d > 0 ? '+' : '-'}${fmt(Math.abs(p))}%)` : 'stabil';
          col = tone(d);
        } else {
          const d = t.cur[1] - t.first[1]; txt = d ? `${d > 0 ? '+' : ''}${d} reps` : 'stabil'; col = tone(d);
        }
      }
      font('bold', 8.4); ink(col); doc.text(txt, cx + (CW - 149) / 2, ry + 6, { align: 'center' });
    });
    y = ty + Math.max(1, R.top.length) * lrh + 12;

    title('Highlight bulan ini', y);
    y += 7;
    R.highlights.forEach(h => {
      font('normal', 9.4);
      const lines = doc.splitTextToSize(h, CW - 9);
      fill(C.green); doc.circle(M + 2, y - 1.2, 1.1, 'F');
      ink(C.ink); doc.text(lines, M + 6, y);
      y += lines.length * 4.6 + 2.2;
    });

    const nt = String(notes || '').trim();
    if (nt) {
      y += 6; title('Catatan coach', y); y += 5;
      font('normal', 9.4);
      let lines = doc.splitTextToSize(nt, CW - 12);
      const maxLines = Math.floor((262 - y - 8) / 4.7);
      if (lines.length > maxLines) { lines = lines.slice(0, Math.max(1, maxLines)); lines[lines.length - 1] += ' …'; }
      const bh = lines.length * 4.7 + 8;
      fill(C.tint); doc.roundedRect(M, y, CW, bh, 2.5, 2.5, 'F');
      fill(C.teal); doc.rect(M, y + 3, 1.2, bh - 6, 'F');
      ink(C.ink); doc.text(lines, M + 6, y + 7);
      y += bh;
    }
    // tanda tangan coach
    y = Math.min(Math.max(y + 12, 250), 268);
    font('bold', 10); ink(C.ink); doc.text('Coach ' + A.name, M, y);
    font('normal', 8.5); ink(C.mute);
    doc.text([A.gym, A.phone ? 'WhatsApp ' + A.phone : ''].filter(Boolean).join('  ·  ') || 'Bodimentor PT', M, y + 5);
    footer(2);

    /* ===== HALAMAN 3: BEFORE – AFTER ===== */
    if (BA) {
      doc.addPage();
      fill(C.dark); doc.rect(0, 0, W, 24, 'F');
      brand(M, 7, 14);
      font('bold', 10); ink(C.white); doc.text(c.name, W - M, 11.5, { align: 'right' });
      font('normal', 8.5); ink([150, 165, 180]); doc.text(period, W - M, 17, { align: 'right' });
      stripe(24, 1.2);
      y = 37; title('Before – After', y, 'foto progres klien');
      const bw = (CW - 8) / 2, bh = bw * 4 / 3, by = y + 6;
      const put = (p, x, yy, w, h) => {
        fill(C.soft); doc.roundedRect(x, yy, w, h, 2.5, 2.5, 'F');
        try {
          const pr = doc.getImageProperties(p.data), k = Math.min(w / pr.width, h / pr.height);
          const iw = pr.width * k, ih = pr.height * k;
          doc.addImage(p.data, 'JPEG', x + (w - iw) / 2, yy + (h - ih) / 2, iw, ih, undefined, 'FAST');
        } catch (e) { font('normal', 8); ink(C.mute); doc.text('Foto tidak bisa dimuat', x + w / 2, yy + h / 2, { align: 'center' }); }
      };
      const cap = (p, x, label, col) => {
        fill(col); doc.roundedRect(x, by + bh + 4, 22, 7, 3.5, 3.5, 'F');
        font('bold', 8); ink(C.white); doc.text(label, x + 11, by + bh + 8.8, { align: 'center' });
        font('bold', 9.5); ink(C.ink); doc.text(PT.fmtDate(p.date), x + 25, by + bh + 8.8);
        if (p.weight != null) { font('normal', 9); ink(C.mute); doc.text(f1(p.weight) + ' kg', x + bw, by + bh + 8.8, { align: 'right' }); }
      };
      put(BA.before, M, by, bw, bh); put(BA.after, M + bw + 8, by, bw, bh);
      cap(BA.before, M, 'BEFORE', C.mute); cap(BA.after, M + bw + 8, 'AFTER', C.teal);
      y = by + bh + 20;
      const days = PT.daysBetween(BA.before.date, BA.after.date);
      let line = `${days} hari progres`;
      if (BA.before.weight != null && BA.after.weight != null) {
        const d = BA.after.weight - BA.before.weight;
        line += Math.abs(d) >= 0.1 ? ` · berat badan ${d < 0 ? 'turun' : 'naik'} ${f1(Math.abs(d))} kg` : ' · berat badan stabil';
      }
      fill(C.tint); doc.roundedRect(M, y - 6, CW, 11, 2.5, 2.5, 'F');
      font('bold', 10); ink(C.ink); doc.text(line, M + CW / 2, y + 1.2, { align: 'center' });
      if (BA.mids.length) {
        y += 16; title('Perjalanan', y);
        const n = BA.mids.length + 2, gap = 4, tw = (CW - gap * (n - 1)) / n, th = Math.min(tw * 4 / 3, 283 - 12 - (y + 6));
        [BA.before].concat(BA.mids, [BA.after]).forEach((p, i) => {
          const x = M + i * (tw + gap);
          put(p, x, y + 5, tw, th);
          font('normal', 7.2); ink(C.mute); doc.text(PT.fmtDate(p.date, false) + (p.weight != null ? ' · ' + f1(p.weight) + ' kg' : ''), x + tw / 2, y + 5 + th + 4.5, { align: 'center' });
        });
      }
      footer(3);
    }

    function lineBox(x, y0, w, h) {
      fill(C.soft); doc.roundedRect(x, y0, w, h, 2.5, 2.5, 'F');
      font('bold', 9.5); ink(C.ink); doc.text('Tren berat badan', x + 5, y0 + 8);
      const pts = R.series;
      if (pts.length) { font('bold', 8.5); ink(C.teal); doc.text(f1(pts[pts.length - 1].weight) + ' kg', x + w - 5, y0 + 8, { align: 'right' }); }
      if (pts.length < 2) { font('normal', 8.5); ink(C.mute); doc.text('Belum cukup data pengukuran.', x + w / 2, y0 + h / 2, { align: 'center' }); return; }
      const px = x + 15, py = y0 + 15, pw = w - 21, ph = h - 26;
      const ys = pts.map(p => p.weight);
      let lo = Math.min(...ys), hi = Math.max(...ys); const pad = (hi - lo) * 0.2 || 1; lo -= pad; hi += pad;
      const t0 = PT.parse(pts[0].date).getTime(), t1 = PT.parse(pts[pts.length - 1].date).getTime() || t0 + 1;
      const X = d => px + (PT.parse(d).getTime() - t0) / ((t1 - t0) || 1) * pw;
      const Y = v => py + (1 - (v - lo) / (hi - lo)) * ph;
      draw(C.line); doc.setLineWidth(0.25);
      [0, 0.5, 1].forEach(f => { const v = lo + (hi - lo) * f; doc.line(px, Y(v), px + pw, Y(v)); font('normal', 6.8); ink(C.mute); doc.text(f1(v), px - 2, Y(v) + 1, { align: 'right' }); });
      draw(C.teal); doc.setLineWidth(0.8);
      for (let i = 1; i < pts.length; i++) doc.line(X(pts[i - 1].date), Y(pts[i - 1].weight), X(pts[i].date), Y(pts[i].weight));
      fill(C.green); pts.forEach(p => doc.circle(X(p.date), Y(p.weight), 0.9, 'F'));
      font('normal', 6.8); ink(C.mute);
      doc.text(PT.fmtDate(pts[0].date, false), px, py + ph + 6);
      doc.text(PT.fmtDate(pts[pts.length - 1].date, false), px + pw, py + ph + 6, { align: 'right' });
    }
    function barBox(x, y0, w, h) {
      fill(C.soft); doc.roundedRect(x, y0, w, h, 2.5, 2.5, 'F');
      font('bold', 9.5); ink(C.ink); doc.text('Volume latihan per bulan', x + 5, y0 + 8);
      const Ms = R.months, max = Math.max(...Ms.map(m => m.volume), 1);
      const px = x + 7, py = y0 + 17, pw = w - 14, ph = h - 29;
      const slot = pw / Ms.length, bw = Math.min(15, slot * 0.58);
      draw(C.line); doc.setLineWidth(0.25); doc.line(px, py + ph, px + pw, py + ph);
      Ms.forEach((m, i) => {
        const bh = m.volume / max * ph, bx = px + slot * i + (slot - bw) / 2, isCur = i === Ms.length - 1;
        fill(isCur ? C.green : C.barOld);
        if (bh > 0.5) doc.roundedRect(bx, py + ph - bh, bw, bh, 1, 1, 'F');
        font('bold', 6.8); ink(isCur ? C.ink : C.mute);
        doc.text(m.volume ? fmt(m.volume / 1000, 1) + ' rb' : '0', bx + bw / 2, py + ph - bh - 1.8, { align: 'center' });
        font(isCur ? 'bold' : 'normal', 7.2); ink(isCur ? C.ink : C.mute);
        doc.text(m.label.split(' ')[0], bx + bw / 2, py + ph + 5.5, { align: 'center' });
      });
      font('normal', 6.5); ink(C.mute); doc.text('kg total (beban × reps)', x + w - 5, y0 + 8, { align: 'right' });
    }

    const safe = c.name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const filename = `Laporan-Progres_${safe}_${PT.monthLabel(key).replace(' ', '-')}.pdf`;
    return { doc, blob: doc.output('blob'), filename, waText: waText(R), R };
  }

  function download(out) {
    const url = URL.createObjectURL(out.blob);
    const a = document.createElement('a'); a.href = url; a.download = out.filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  const waUrl = (phone, text) => `https://wa.me/${phone ? normPhone(phone) : ''}?text=${encodeURIComponent(text || '')}`;

  // HP: buka share sheet (pilih WhatsApp → PDF langsung terlampir).
  // Desktop / browser tanpa share file: unduh PDF + buka chat WhatsApp klien.
  // Harus dipanggil langsung dari event klik (tanpa await sebelumnya).
  function sendWA(out, phone) {
    let file = null;
    try { file = new File([out.blob], out.filename, { type: 'application/pdf' }); } catch (e) { }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      return navigator.share({ files: [file], title: out.filename, text: out.waText })
        .then(() => 'shared')
        .catch(e => (e && e.name === 'AbortError') ? 'cancel' : 'error');
    }
    download(out);
    window.open(waUrl(phone, out.waText), '_blank', 'noopener');
    return Promise.resolve('fallback');
  }

  return { summary, prepare, build, download, sendWA, waUrl, normPhone };
})();
