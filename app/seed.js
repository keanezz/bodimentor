/* ============================================================
   BODIMENTOR PT — template program bawaan + contoh klien
   Contoh klien ditandai demo:true dan bisa dihapus dari menu Akun.
   ============================================================ */
window.PTSeed = (function () {
  'use strict';

  // Deterministic PRNG biar contoh datanya selalu sama
  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const TEMPLATES = [
    { name: 'Full Body Pemula', desc: '3× seminggu · cocok buat klien baru', days: [
      { name: 'Hari A', exercises: [['Squat', 3, '10'], ['Barbell Bench Press', 3, '10'], ['Seated Cable Row', 3, '12'], ['Dumbbell Shoulder Press', 3, '12'], ['Plank', 3, '30']] },
      { name: 'Hari B', exercises: [['Romanian Deadlift (Barbell)', 3, '10'], ['Incline Dumbbell Bench Press', 3, '10'], ['Wide-Grip Pulldown', 3, '12'], ['Walking Lunge', 3, '10'], ['Crunch', 3, '15']] },
    ] },
    { name: 'Upper / Lower', desc: '4× seminggu · naik otot & kekuatan', days: [
      { name: 'Upper A', exercises: [['Barbell Bench Press', 4, '6-8'], ['Barbell Row', 4, '8'], ['Overhead Press (Barbell)', 3, '8'], ['Wide-Grip Pulldown', 3, '10'], ['Bicep Curl (Barbell)', 3, '10'], ['Triceps Pushdown', 3, '12']] },
      { name: 'Lower A', exercises: [['Squat', 4, '6-8'], ['Romanian Deadlift (Barbell)', 3, '8'], ['Leg Press', 3, '10'], ['Lying Leg Curl', 3, '12'], ['Standing Calf Raise', 4, '12']] },
      { name: 'Upper B', exercises: [['Incline Dumbbell Bench Press', 4, '8-10'], ['Seated Cable Row', 4, '10'], ['Dumbbell Shoulder Press', 3, '10'], ['Dumbbell Lateral Raise', 3, '15'], ['Face Pull', 3, '15']] },
      { name: 'Lower B', exercises: [['Barbell Deadlift', 3, '5'], ['Leg Press', 3, '12'], ['Walking Lunge', 3, '10'], ['Leg Extension', 3, '12'], ['Plank', 3, '45']] },
    ] },
    { name: 'Push / Pull / Legs', desc: '3–6× seminggu · klien level lanjut', days: [
      { name: 'Push', exercises: [['Barbell Bench Press', 4, '8'], ['Incline Dumbbell Bench Press', 3, '10'], ['Dumbbell Shoulder Press', 3, '10'], ['Dumbbell Lateral Raise', 3, '15'], ['Triceps Pushdown', 3, '12']] },
      { name: 'Pull', exercises: [['Barbell Deadlift', 3, '5'], ['Pull Up', 3, '8'], ['Seated Cable Row', 3, '10'], ['Face Pull', 3, '15'], ['Bicep Curl (Barbell)', 3, '10']] },
      { name: 'Legs', exercises: [['Squat', 4, '8'], ['Leg Press', 3, '10'], ['Lying Leg Curl', 3, '12'], ['Leg Extension', 3, '12'], ['Standing Calf Raise', 4, '15']] },
    ] },
  ];

  // Beban awal (kg) untuk klien "faktor 1.0". 0 = bodyweight (progres di reps / detik)
  const BASE = {
    'Squat': 80, 'Barbell Bench Press': 60, 'Seated Cable Row': 50, 'Dumbbell Shoulder Press': 18, 'Plank': 0,
    'Romanian Deadlift (Barbell)': 70, 'Incline Dumbbell Bench Press': 22, 'Wide-Grip Pulldown': 50, 'Walking Lunge': 12, 'Crunch': 0,
    'Barbell Row': 55, 'Overhead Press (Barbell)': 37.5, 'Bicep Curl (Barbell)': 25, 'Triceps Pushdown': 25, 'Leg Press': 140,
    'Lying Leg Curl': 35, 'Standing Calf Raise': 60, 'Dumbbell Lateral Raise': 8, 'Face Pull': 20, 'Barbell Deadlift': 100,
    'Leg Extension': 40, 'Pull Up': 0,
  };

  const CLIENTS = [
    { name: 'Andi Pratama', gender: 'L', age: 28, heightCm: 175, phone: '081234567801', goal: 'Naik massa otot', type: 'Gym (1-on-1)', level: 'Menengah', perWeek: 4, prog: 1, days: 120, f: 1.0, g: 0.24, w: [68, 72.6], bf: [17, 16.2], waist: [80, 81], pkgExtra: 8, pkgDays: 28,
      notes: 'Bahu kanan agak sensitif di overhead press — ganti dumbbell kalau terasa nyeri.' },
    { name: 'Sinta Maharani', gender: 'P', age: 32, heightCm: 160, phone: '081234567802', goal: 'Turun lemak', type: 'Gym (1-on-1)', level: 'Pemula', perWeek: 3, prog: 0, days: 112, f: 0.38, g: 0.7, w: [68.4, 62.3], bf: [34, 29.1], waist: [86, 79],
      notes: 'Target acara nikahan Desember. Suka cardio, kurang suka latihan kaki.' },
    { name: 'Budi Santoso', gender: 'L', age: 45, heightCm: 170, phone: '081234567803', goal: 'Kebugaran & kesehatan', type: 'Home visit', level: 'Pemula', perWeek: 2, prog: 0, days: 95, stopAgo: 9, f: 0.6, g: 0.25, w: [88, 84.6], bf: [29, 26.8], waist: [98, 94],
      notes: 'Riwayat nyeri punggung bawah — hindari deadlift berat, fokus core & mobilitas.' },
    { name: 'Rina Wijaya', gender: 'P', age: 24, heightCm: 165, phone: '081234567804', goal: 'Kekuatan & performa', type: 'Gym (1-on-1)', level: 'Lanjutan', perWeek: 5, prog: 2, days: 105, f: 0.72, g: 0.26, w: [57, 58.1], bf: [22, 21], waist: [66, 65.5],
      notes: 'Persiapan lomba HYROX bulan depan.' },
    { name: 'Dimas Aditya', gender: 'L', age: 19, heightCm: 178, phone: '081234567805', goal: 'Naik berat badan', type: 'Online coaching', level: 'Pemula', perWeek: 3, prog: 0, days: 62, f: 0.55, g: 0.4, w: [58, 61.4], bf: [12, 13], waist: [70, 71.5], pkgExtra: 2, pkgDays: 30,
      notes: 'Susah makan banyak — target 2.800 kkal/hari.' },
    { name: 'Yoga Prasetyo', gender: 'L', age: 35, heightCm: 172, phone: '081234567806', goal: 'Turun lemak', type: 'Kelas / grup', level: 'Menengah', perWeek: 2, prog: 0, days: 200, stopAgo: 70, f: 0.8, g: 0.1, w: [82, 80.5], bf: [24, 23], waist: [90, 88], inactive: true,
      notes: '' },
  ];

  const lerp = (a, b, t) => a + (b - a) * t;
  const r1 = x => Math.round(x * 10) / 10;
  const roundKg = (x, base) => base < 25 ? Math.max(1, Math.round(x)) : Math.max(2.5, Math.round(x / 2.5) * 2.5);

  function makeSets(ex, spec, t, r) {
    const top = parseInt(String(ex.reps).split('-').pop(), 10) || 10;
    const base = BASE[ex.name] != null ? BASE[ex.name] : 20;
    const out = [];
    if (!base) {
      const reps = ex.name === 'Pull Up' ? Math.round(3 + 5 * t) : Math.min(top * 2, Math.round(top * (1 + 1.5 * t * spec.g)));
      for (let i = 0; i < ex.sets; i++) out.push([0, Math.max(1, reps - (i === ex.sets - 1 && r() < 0.5 ? 1 : 0))]);
      return out;
    }
    const kg = roundKg(base * spec.f * (1 + spec.g * t) * (0.97 + r() * 0.05), base);
    for (let i = 0; i < ex.sets; i++) out.push([kg, i === ex.sets - 1 && r() < 0.4 ? top - 1 : top]);
    return out;
  }

  function programs() {
    const S = PT.S;
    if (S.programs.length) return;
    TEMPLATES.forEach(t => S.programs.push({
      id: PT.uid('p'), name: t.name, desc: t.desc,
      days: t.days.map(d => ({ id: PT.uid('d'), name: d.name, exercises: d.exercises.map(([name, sets, reps]) => ({ name, sets, reps })) })),
    }));
    PT.save();
  }

  function demo() {
    programs();
    const S = PT.S, r = rng(20260925), T = PT.today(), year = new Date().getFullYear();
    const progs = S.programs;
    CLIENTS.forEach(spec => {
      const start = PT.addDays(T, -spec.days);
      const stop = spec.stopAgo ? PT.addDays(T, -spec.stopAgo) : T;
      const prog = progs[spec.prog] || progs[0];
      const c = {
        id: PT.uid('c'), demo: true, createdAt: PT.parse(start).getTime(), active: !spec.inactive,
        name: spec.name, phone: spec.phone, gender: spec.gender, birthYear: year - spec.age, heightCm: spec.heightCm,
        goal: spec.goal, type: spec.type, level: spec.level, perWeek: spec.perWeek, programId: prog.id,
        startDate: start, notes: spec.notes,
      };
      S.clients.push(c);

      let di = 0;
      for (let d = 0; d <= spec.days; d++) {
        const date = PT.addDays(start, d);
        if (date > stop) break;
        if (d > 0 && r() > spec.perWeek / 7) continue;
        const day = prog.days[di++ % prog.days.length];
        const t = d / spec.days;
        S.sessions.push({
          id: PT.uid('s'), clientId: c.id, date, programId: prog.id, dayName: day.name,
          exercises: day.exercises.map(ex => ({ name: ex.name, sets: makeSets(ex, spec, t, r) })),
          notes: '', createdAt: PT.parse(date).getTime() + 17 * 36e5,
        });
      }
      for (let d = 0; d <= spec.days; d += 14) {
        const date = PT.addDays(start, d);
        if (date > stop) break;
        const t = d / spec.days;
        S.measurements.push({
          id: PT.uid('m'), clientId: c.id, date,
          weight: r1(lerp(spec.w[0], spec.w[1], t) + (r() - 0.5) * 0.4),
          bodyFat: r1(lerp(spec.bf[0], spec.bf[1], t)),
          waist: r1(lerp(spec.waist[0], spec.waist[1], t)),
        });
      }
      if (spec.pkgExtra) {
        c.pkgStart = PT.addDays(T, -spec.pkgDays);
        c.pkgTotal = S.sessions.filter(s => s.clientId === c.id && s.date >= c.pkgStart).length + spec.pkgExtra;
      }
    });
    PT.save();
  }

  return { programs, demo };
})();
