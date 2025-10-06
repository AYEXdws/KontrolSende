/* =========================================================
   KontrolSende • main.js
   - Glass menü (hamburger → X)
   - Tema kalıcı (localStorage)
   - Test (quiz) + sonuç kaydı
   - Etkinlikler (dinamik) + Admin CRUD
   - DB katmanı: LocalStorage (mock) → NeonDB API'ye bağlı
   ========================================================= */

/* =========================
   0) KÜÇÜK YARDIMCILAR
   ========================= */
const $  = (sel,scope=document)=> scope.querySelector(sel);
const $$ = (sel,scope=document)=> scope.querySelectorAll(sel);

function uid() { return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36); }
function nowISO() { return new Date().toISOString(); }
function safeJSON(str, fallback) { try { return JSON.parse(str); } catch { return fallback; } }

/* =========================
   1) DB KATMANI (Mock)
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
   2) NAVBAR + TEMA
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const header = $('#ks-header');
  const btn = $('#ks-hamburger');
  const drawer = $('#ks-drawer');
  if (!header || !btn || !drawer) return;

  const setOffset = () => {
    const h = header.offsetHeight || 64;
    document.documentElement.style.setProperty('--ks-offset', `${h}px`);
  };
  setOffset();
  addEventListener('resize', setOffset);

  let backdrop = document.querySelector('.ks-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'ks-backdrop';
    document.body.appendChild(backdrop);
  }

  const open = () => {
    drawer.classList.add('ks-open');
    btn.classList.add('ks-active');
    btn.setAttribute('aria-expanded', 'true');
    backdrop.classList.add('ks-show');
    document.documentElement.style.overflow = 'hidden';
  };
  const close = () => {
    drawer.classList.remove('ks-open');
    btn.classList.remove('ks-active');
    btn.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('ks-show');
    document.documentElement.style.overflow = '';
  };
  const toggle = () => (drawer.classList.contains('ks-open') ? close() : open());

  btn.addEventListener('click', toggle);
  backdrop.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  const current = location.pathname.split('/').pop() || 'index.html';
  drawer.querySelectorAll('a').forEach(a => {
    a.removeAttribute('aria-current');
    if (a.getAttribute('href') === current) a.setAttribute('aria-current', 'page');
  });
});

/* =========================
   3) TEST (quiz)
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const quizContainer = $('#quiz-container');
  if (!quizContainer) return;

  const questions = [
    { cat: 'Sigara', q: 'Sigara içme düşüncesi gün içinde ne sıklıkla aklına geliyor?', a: [['Hiç gelmiyor.', 0], ['Ara sıra aklıma gelir.', 1], ['Sık aklıma geliyor.', 2], ['Çoğu zaman aklımdan çıkmıyor.', 3]] },
    { cat: 'Sigara', q: 'Sigara içilen ortamlarda bulunmak seni nasıl etkiler?', a: [['Etkilenmem, nötrüm.', 0], ['Biraz etkilenirim.', 1], ['Canım çekebilir.', 2], ['Dayanmakta zorlanırım.', 3]] },
    { cat: 'Alkol', q: 'Alkol tüketme sıklığın nasıldır?', a: [['Hiç/çok nadir.', 0], ['Ara sıra.', 1], ['Düzenli.', 2], ['Sık ve kontrol zor.', 3]] },
    { cat: 'Dijital', q: 'Telefon/sosyal medya/oyun yüzünden uykunu ertelediğin olur mu?', a: [['Hayır.', 0], ['Nadiren.', 1], ['Bazen sık.', 2], ['Çoğu zaman.', 3]] },
  ];

  let i = 0;
  const picked = Array(questions.length).fill(null);

  const progressBar = $('#progress-bar');
  const qWrap = $('#question-container');
  const nextBtn = $('#next-btn');
  const prevBtn = $('#prev-btn');
  const result = $('#result-container');

  function updateProgress() {
    const answered = picked.filter(v => v !== null).length;
    const pct = Math.round((answered / questions.length) * 100);
    if (progressBar) progressBar.style.width = pct + '%';
  }

  function renderQuestion() {
    const q = questions[i];
    qWrap.innerHTML = `
      <p>${q.q}</p>
      <div class="options">
        ${q.a
          .map(
            (pair, idx) => `
          <button class="option ${picked[i] === idx ? 'selected' : ''}" data-i="${idx}">
            ${pair[0]}
          </button>`
          )
          .join('')}
      </div>
    `;
    qWrap.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = Number(e.currentTarget.dataset.i);
        picked[i] = idx;
        qWrap.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        updateProgress();
      });
    });
    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) nextBtn.textContent = i === questions.length - 1 ? 'Bitir' : 'Sonraki';
  }

  function computeStats() {
    const totals = {};
    const maxs = {};
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
    const cats = Object.keys(maxs).map(cat => {
      const pct = Math.round(((totals[cat] || 0) / maxs[cat]) * 100);
      return { cat, pct };
    });
    return { totalPct, cats };
  }

  function showResults() {
    const stats = computeStats();
    $('#quiz-container').style.display = 'none';
    result.style.display = 'block';
    result.innerHTML = `
      <h2>Genel Görünüm: ${stats.totalPct}%</h2>
      <p>Sonuç teşhis değildir; farkındalık amaçlıdır.</p>
      <button id="save-result" class="btn btn-primary">Sonucumu Kaydet</button>
    `;
    $('#save-result')?.addEventListener('click', async () => {
      await DB.addResult({ at: nowISO(), totalPct: stats.totalPct, cats: stats.cats, from: 'test' });
      alert('Sonucunuz kaydedildi.');

      // 🔹 NeonDB API'ye gönder
      fetch("https://kontrolsende-1.onrender.com/addResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_pct: stats.totalPct,
          cats: stats.cats
        })
      })
        .then(res => res.json())
        .then(data => console.log("✅ NeonDB'ye kaydedildi:", data))
        .catch(err => console.error("❌ NeonDB hatası:", err));
    });
  }

  function next() {
    if (picked[i] === null) {
      alert('Lütfen bir seçenek seç.');
      return;
    }
    if (i < questions.length - 1) {
      i++;
      renderQuestion();
    } else {
      showResults();
    }
  }

  function prev() {
    if (i > 0) {
      i--;
      renderQuestion();
    }
  }

  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);
  renderQuestion();
});

/* =========================
   4) ETKİNLİKLER SAYFASI
   ========================= */
document.addEventListener('DOMContentLoaded', async () => {
  const listEl = $('#event-list');
  if (!listEl) return;
  const events = await DB.getEvents();
  if (!events.length) {
    listEl.innerHTML = `<p class="muted">Henüz etkinlik yok.</p>`;
    return;
  }
  listEl.innerHTML = events.map(ev => `
    <article class="event-card">
      <img src="${ev.img}" alt="${ev.title}">
      <h3>${ev.title}</h3>
      <p>${ev.desc}</p>
    </article>
  `).join('');
});
