/* =========================================================
   KontrolSende • main.js
   ========================================================= */

/* =========================
   0) KÜÇÜK YARDIMCILAR
   ========================= */
const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => scope.querySelectorAll(sel);
function uid() { return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36); }
function nowISO() { return new Date().toISOString(); }
function safeJSON(str, fallback) { try { return JSON.parse(str); } catch { return fallback; } }

/* =========================
   1) DB KATMANI (Mock → NeonDB API)
   ========================= */
const DB = (() => {
  const KEYS = { events: 'ks_events', results: 'ks_results' };

  function ensureMockSeed() {
    const cur = safeJSON(localStorage.getItem(KEYS.events), []);
    if (!cur || cur.length === 0) {
      const seed = [
        {
          id: uid(),
          title: 'Farkındalık Semineri',
          desc: 'Sigara ve alkolün beyindeki etkileri.',
          img: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c67?q=80&w=1200&auto=format&fit=crop',
          at: nowISO()
        },
        {
          id: uid(),
          title: 'Dijital Detoks Atölyesi',
          desc: 'Bildirim yönetimi, ekran süresi ipuçları.',
          img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
          at: nowISO()
        },
        {
          id: uid(),
          title: 'Sporda Denge',
          desc: 'Sağlıklı alışkanlıklar ve özdenetim.',
          img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
          at: nowISO()
        }
      ];
      localStorage.setItem(KEYS.events, JSON.stringify(seed));
    }
    if (!localStorage.getItem(KEYS.results)) {
      localStorage.setItem(KEYS.results, JSON.stringify([]));
    }
  }

  async function getEvents() {
    ensureMockSeed();
    return safeJSON(localStorage.getItem(KEYS.events), []);
  }
  async function addEvent({ title, desc, img }) {
    const item = { id: uid(), title, desc, img, at: nowISO() };
    const list = safeJSON(localStorage.getItem(KEYS.events), []);
    list.unshift(item);
    localStorage.setItem(KEYS.events, JSON.stringify(list));
    return item;
  }
  async function deleteEvent(id) {
    const list = safeJSON(localStorage.getItem(KEYS.events), []);
    const next = list.filter(e => e.id !== id);
    localStorage.setItem(KEYS.events, JSON.stringify(next));
    return true;
  }
  async function addResult(resultObj) {
    const list = safeJSON(localStorage.getItem(KEYS.results), []);
    list.unshift(resultObj);
    localStorage.setItem(KEYS.results, JSON.stringify(list));
    return true;
  }
  async function getResults() {
    return safeJSON(localStorage.getItem(KEYS.results), []);
  }
  async function clearResults() {
    localStorage.setItem(KEYS.results, JSON.stringify([]));
    return true;
  }

  return { getEvents, addEvent, deleteEvent, addResult, getResults, clearResults };
})();

/* =========================
   2) NAVBAR
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const header = $('#ks-header');
  const btn = $('#ks-hamburger');
  const drawer = $('#ks-drawer');
  if (!header || !btn || !drawer) return;
  let backdrop = document.querySelector('.ks-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'ks-backdrop';
    document.body.appendChild(backdrop);
  }
  const open = () => { drawer.classList.add('ks-open'); btn.classList.add('ks-active'); backdrop.classList.add('ks-show'); };
  const close = () => { drawer.classList.remove('ks-open'); btn.classList.remove('ks-active'); backdrop.classList.remove('ks-show'); };
  btn.onclick = () => drawer.classList.contains('ks-open') ? close() : open();
  backdrop.onclick = close;
});

/* =========================
   3) TEST (quiz) — DÜZELTİLMİŞ
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const quiz = $('#quiz-container');
  if (!quiz) return;

  const questions = [
    // Sigara
    { cat: 'Sigara', q: 'Sigara içme düşüncesi gün içinde ne sıklıkla aklına geliyor?', a: [['Hiç gelmiyor.', 0], ['Ara sıra aklıma gelir.', 1], ['Sık aklıma geliyor.', 2], ['Çoğu zaman aklımdan çıkmıyor.', 3]] },
    { cat: 'Sigara', q: 'Sigara içilen ortamlarda bulunmak seni nasıl etkiler?', a: [['Etkilenmem.', 0], ['Biraz etkilenirim.', 1], ['Canım çekebilir.', 2], ['Dayanmakta zorlanırım.', 3]] },
    { cat: 'Sigara', q: 'Daha önce bırakmayı denedin mi?', a: [['İçmiyorum.', 0], ['Denemedim ama düşünüyorum.', 1], ['Kısa süreli bırakabildim.', 2], ['Birçok kez denedim.', 3]] },
    { cat: 'Sigara', q: 'Yasak ortamlarda ne hissedersin?', a: [['Normal.', 0], ['Biraz huzursuz.', 1], ['Gergin olurum.', 2], ['Yoğun istek.', 3]] },
    // Alkol
    { cat: 'Alkol', q: 'Alkol tüketme sıklığın nasıldır?', a: [['Hiç/çok nadir.', 0], ['Ara sıra.', 1], ['Düzenli.', 2], ['Sık ve kontrol zor.', 3]] },
    { cat: 'Alkol', q: 'Moralin bozukken alkolü çözüm gibi görür müsün?', a: [['Hayır.', 0], ['Bazen aklımdan geçer.', 1], ['Çoğu zaman öyle olur.', 2], ['Genelde ilk seçeneğimdir.', 3]] },
    { cat: 'Alkol', q: 'Alkol sonrası sorumlulukların etkilenir mi?', a: [['Hayır.', 0], ['Nadiren.', 1], ['Bazen ciddi etkiler.', 2], ['Sıklıkla olumsuz etkiler.', 3]] },
    { cat: 'Alkol', q: 'Kaç kadehle duracağını kontrol etmek zorlaşır mı?', a: [['Hayır.', 0], ['Bazen.', 1], ['Sık zorlanırım.', 2], ['Genelde kontrol edemem.', 3]] },
    // Dijital
    { cat: 'Dijital', q: 'Telefon/sosyal medya/oyun yüzünden uykunu ertelediğin olur mu?', a: [['Hayır.', 0], ['Nadiren.', 1], ['Bazen sık.', 2], ['Çoğu zaman.', 3]] },
    { cat: 'Dijital', q: 'Gerçek planları dijital aktivite için iptal ettiğin olur mu?', a: [['Asla.', 0], ['Nadiren.', 1], ['Bazen.', 2], ['Sıklıkla.', 3]] },
    { cat: 'Dijital', q: 'Ekran süresini azaltmakta zorlanır mısın?', a: [['Kolay azaltırım.', 0], ['Biraz zorlanırım.', 1], ['Zorlanırım.', 2], ['Çok zorlanırım.', 3]] },
    { cat: 'Dijital', q: 'Bildirim gelmese de sık kontrol eder misin?', a: [['Hayır.', 0], ['Ara sıra.', 1], ['Sık sık.', 2], ['Sürekli kontrol ederim.', 3]] },
    // Alışveriş/Kumar
    { cat: 'Alışveriş/Kumar', q: 'Planladığından fazla para harcar mısın?', a: [['Hayır.', 0], ['Nadiren.', 1], ['Bazen.', 2], ['Sıklıkla.', 3]] },
    { cat: 'Alışveriş/Kumar', q: 'Pişman olup kaybı telafi etmeye çalışır mısın?', a: [['Hayır.', 0], ['Ara sıra.', 1], ['Sık.', 2], ['Çoğu zaman.', 3]] },
    // Genel
    { cat: 'Genel', q: '“Kontrol bende” duygun ne kadar güçlü?', a: [['Güçlü hissediyorum.', 0], ['Genelde iyi.', 1], ['Dalgalanıyor.', 2], ['Zayıf.', 3]] },
    { cat: 'Genel', q: 'Zorlanmalarda sağlıklı başa çıkma yollarını kullanma sıklığın?', a: [['Sıklıkla.', 0], ['Ara sıra.', 1], ['Nadiren.', 2], ['Zorlanırım.', 3]] }
  ];

  let i = 0;
  const picked = Array(questions.length).fill(null);

  const qWrap = $('#question-container');
  const nextBtn = $('#next-btn');
  const prevBtn = $('#prev-btn');
  const result = $('#result-container');

  function computeStats() {
    const totals = {}, maxs = {};
    questions.forEach((q, idx) => {
      const p = picked[idx];
      if (p === null) return;
      const score = q.a[p][1];
      totals[q.cat] = (totals[q.cat] || 0) + score;
      maxs[q.cat] = (maxs[q.cat] || 0) + 3;
    });
    const totalScore = Object.values(totals).reduce((a, b) => a + b, 0);
    const maxScore = questions.length * 3;
    const totalPct = Math.round((totalScore / maxScore) * 100);
    const cats = Object.keys(maxs).map(cat => ({
      cat, pct: Math.round(((totals[cat] || 0) / maxs[cat]) * 100)
    }));
    return { totalPct, cats };
  }

  function level(pct) {
    if (pct <= 33) return 'Düşük eğilim';
    if (pct <= 66) return 'Orta eğilim';
    return 'Yüksek eğilim';
  }

  function renderQuestion() {
    const q = questions[i];
    qWrap.innerHTML = `
      <h3>${q.cat}</h3>
      <p>${q.q}</p>
      <div class="options">
        ${q.a.map((pair, idx) => `
          <button class="option ${picked[i] === idx ? 'selected' : ''}" data-i="${idx}">
            ${pair[0]}
          </button>`).join('')}
      </div>`;
    qWrap.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', e => {
        picked[i] = Number(e.target.dataset.i);
        qWrap.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
      });
    });
    prevBtn.disabled = i === 0;
    nextBtn.textContent = i === questions.length - 1 ? 'Bitir' : 'Sonraki';
  }

  function showResults() {
    const stats = computeStats();
    const genel = level(stats.totalPct);
    quiz.style.display = 'none';
    result.style.display = 'block';
    result.innerHTML = `
      <h2>Genel Sonuç: ${genel} (${stats.totalPct}%)</h2>
      <p class="muted">Bu test teşhis değil, farkındalık amaçlıdır.</p>
      <div class="bars">
        ${stats.cats.map(c => `
          <div class="bar">
            <strong>${c.cat}</strong>
            <div class="bar-bg"><div class="bar-fill" style="width:${c.pct}%;"></div></div>
            <span>${c.pct}%</span>
          </div>`).join('')}
      </div>
      <button id="save-result" class="btn btn-primary">Sonucumu Kaydet</button>
    `;
    $('#save-result').onclick = async () => {
      const payload = { at: nowISO(), totalPct: stats.totalPct, cats: stats.cats };
      await DB.addResult(payload);
      fetch("https://kontrolsende-1.onrender.com/addResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_pct: stats.totalPct, cats: stats.cats })
      }).then(r => r.json())
        .then(() => alert('Sonucunuz başarıyla kaydedildi.'))
        .catch(() => alert('Veritabanına kaydedilemedi.'));
    };
  }

  nextBtn.onclick = () => {
    if (picked[i] === null) return alert('Lütfen bir seçenek seçiniz.');
    if (i < questions.length - 1) i++;
    else return showResults();
    renderQuestion();
  };
  prevBtn.onclick = () => { if (i > 0) i--; renderQuestion(); };

  renderQuestion();
});

/* =========================
   4) ETKİNLİKLER SAYFASI
   ========================= */
document.addEventListener('DOMContentLoaded', async () => {
  const listEl = $('#event-list');
  if (!listEl) return;
  const events = await DB.getEvents();
  listEl.innerHTML = events.map(ev => `
    <article><img src="${ev.img}" alt=""><h3>${ev.title}</h3><p>${ev.desc}</p></article>
  `).join('');
});
