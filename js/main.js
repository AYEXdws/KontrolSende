/* =========================================================
   KontrolSende • main.js
   - Glass menü (hamburger → X)
   - Tema kalıcı (localStorage)
   - Test (quiz) + sonuç kaydı
   - Etkinlikler (dinamik) + Admin CRUD
   - DB katmanı: LocalStorage (mock) → Firebase'e hazır
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
   1) DB KATMANI (Mock → Firebase'e hazır)
   ========================= */
const DB = (() => {
  const KEYS = {
    events: 'ks_events',
    results: 'ks_results'
  };

  // İLERİDE: Firebase yapılandırması için yer
  let useFirebase = false;
  let firebaseApi = null; // {db, ref, push, set, get, child, update, remove} vs.

  function ensureMockSeed() {
    // Etkinlik yoksa 3 örnek ekle
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
    // Sonuçlar boş olabilir — seed gerekmez
    if (!localStorage.getItem(KEYS.results)) {
      localStorage.setItem(KEYS.results, JSON.stringify([]));
    }
  }

  async function initFirebase(config) {
    // Not: Bu fonksiyon şimdilik yalnızca API'yı hazırlar (gerçek import yok).
    // Sonra Firebase SDK ekleyip burada initialize edeceğiz.
    // Ör: const app = initializeApp(config); const db = getDatabase(app); vs.
    useFirebase = true;
    firebaseApi = { /* bağlanınca doldurulacak */ };
  }

  // ------- EVENTS -------
  async function getEvents() {
    if (useFirebase) {
      // TODO: Firebase ref ile oku (events koleksiyonu)
      // return await firebaseApi.read('events');
      return []; // geçici
    } else {
      ensureMockSeed();
      return safeJSON(localStorage.getItem(KEYS.events), []);
    }
  }
  async function addEvent({ title, desc, img }) {
    const item = { id: uid(), title, desc, img, at: nowISO() };
    if (useFirebase) {
      // TODO: Firebase'e push
      // await firebaseApi.push('events', item);
      return item;
    } else {
      const list = safeJSON(localStorage.getItem(KEYS.events), []);
      list.unshift(item);
      localStorage.setItem(KEYS.events, JSON.stringify(list));
      return item;
    }
  }
  async function deleteEvent(id) {
    if (useFirebase) {
      // TODO: Firebase'de id ile sil
      return true;
    } else {
      const list = safeJSON(localStorage.getItem(KEYS.events), []);
      const next = list.filter(e => e.id !== id);
      localStorage.setItem(KEYS.events, JSON.stringify(next));
      return true;
    }
  }

  // ------- RESULTS (Test sonuçları) -------
  async function addResult(resultObj) {
    // resultObj: { at, totalPct, cats:[{cat,pct}], from:'test' }
    if (useFirebase) {
      // TODO: Firebase'e push (results)
      return true;
    } else {
      const list = safeJSON(localStorage.getItem(KEYS.results), []);
      list.unshift(resultObj);
      localStorage.setItem(KEYS.results, JSON.stringify(list));
      return true;
    }
  }
  async function getResults() {
    if (useFirebase) {
      // TODO: Firebase'den çek
      return [];
    } else {
      return safeJSON(localStorage.getItem(KEYS.results), []);
    }
  }
  async function clearResults() {
    if (useFirebase) {
      // TODO: Firebase'de toplu silme
      return true;
    } else {
      localStorage.setItem(KEYS.results, JSON.stringify([]));
      return true;
    }
  }

  return {
    initFirebase,
    getEvents, addEvent, deleteEvent,
    addResult, getResults, clearResults
  };
})();

/* =========================
   2) NAVBAR + TEMA
   ========================= */
// NAV: Hamburger menü – sade ve stabil
document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('ks-header');
  const btn    = document.getElementById('ks-hamburger');
  const drawer = document.getElementById('ks-drawer');
  if (!header || !btn || !drawer) return;

  // Header yüksekliği → mobil menü üst boşluk
  const setOffset = ()=>{
    const h = header.offsetHeight || 64;
    document.documentElement.style.setProperty('--ks-offset', `${h}px`);
  };
  setOffset(); addEventListener('resize', setOffset);

  // Backdrop (bir kere oluştur)
  let backdrop = document.querySelector('.ks-backdrop');
  if (!backdrop){
    backdrop = document.createElement('div');
    backdrop.className = 'ks-backdrop';
    document.body.appendChild(backdrop);
  }

  const open = ()=>{
    drawer.classList.add('ks-open');
    btn.classList.add('ks-active');                 // X dönüşümü
    btn.setAttribute('aria-expanded','true');
    backdrop.classList.add('ks-show');
    document.documentElement.style.overflow = 'hidden';
  };
  const close = ()=>{
    drawer.classList.remove('ks-open');
    btn.classList.remove('ks-active');
    btn.setAttribute('aria-expanded','false');
    backdrop.classList.remove('ks-show');
    document.documentElement.style.overflow = '';
  };
  const toggle = ()=> drawer.classList.contains('ks-open') ? close() : open();

  btn.addEventListener('click', toggle);
  backdrop.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a=> a.addEventListener('click', close));

  // Aktif sayfayı otomatik vurgula (yeşil)
  const current = location.pathname.split('/').pop() || 'index.html';
  drawer.querySelectorAll('a').forEach(a=>{
    a.removeAttribute('aria-current');
    if (a.getAttribute('href') === current) a.setAttribute('aria-current','page');
  });
});
/* =========================
   3) TEST (quiz) — sadece test.html'de çalışır
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const quizContainer = $('#quiz-container');
  if (!quizContainer) return; // bu sayfa test değil

  const questions = [
    // SIGARA
    { cat:'Sigara', q:'Sigara içme düşüncesi gün içinde ne sıklıkla aklına geliyor?', a:[
      ['Hiç gelmiyor.',0],['Ara sıra aklıma gelir.',1],['Sık aklıma geliyor.',2],['Çoğu zaman aklımdan çıkmıyor.',3]
    ]},
    { cat:'Sigara', q:'Sigara içilen ortamlarda bulunmak seni nasıl etkiler?', a:[
      ['Etkilenmem, nötrüm.',0],['Biraz etkilenirim.',1],['Canım çekebilir.',2],['Dayanmakta zorlanırım.',3]
    ]},
    { cat:'Sigara', q:'Daha önce bırakmayı denedin mi?', a:[
      ['İhtiyaç duymadım/İçmiyorum.',0],['Denemedim ama düşünüyorum.',1],['Kısa süreli bırakabildim.',2],['Birçok kez denedim.',3]
    ]},
    { cat:'Sigara', q:'Yasak ortamlarda (okul/ev) ne hissedersin?', a:[
      ['Normal, problem yaşamam.',0],['Biraz huzursuz.',1],['Gergin olurum.',2],['Yoğun istek/sinirlilik.',3]
    ]},
    // ALKOL
    { cat:'Alkol', q:'Alkol tüketme sıklığın nasıldır?', a:[
      ['Hiç/çok nadir.',0],['Ara sıra.',1],['Düzenli.',2],['Sık ve kontrol zor.',3]
    ]},
    { cat:'Alkol', q:'Moralin bozukken alkolü çözüm gibi görür müsün?', a:[
      ['Hayır.',0],['Bazen aklımdan geçer.',1],['Çoğu zaman öyle olur.',2],['Genelde ilk seçeneğimdir.',3]
    ]},
    { cat:'Alkol', q:'Alkol sonrası sorumluluklar etkilenir mi?', a:[
      ['Hayır.',0],['Nadiren ufak etkiler.',1],['Bazen ciddi etkiler.',2],['Sıklıkla olumsuz etkiler.',3]
    ]},
    { cat:'Alkol', q:'Kaç kadehle duracağını kontrol etmek zorlaşır mı?', a:[
      ['Hayır.',0],['Bazen.',1],['Sık zorlanırım.',2],['Genelde kontrol edemem.',3]
    ]},
    // DİJİTAL
    { cat:'Dijital', q:'Telefon/sosyal medya/oyun yüzünden uykunu ertelediğin olur mu?', a:[
      ['Hayır.',0],['Nadiren.',1],['Bazen sık.',2],['Çoğu zaman.',3]
    ]},
    { cat:'Dijital', q:'Gerçek planları dijital aktivite için iptal ettiğin olur mu?', a:[
      ['Asla.',0],['Nadiren.',1],['Bazen.',2],['Sıklıkla.',3]
    ]},
    { cat:'Dijital', q:'Ekran süresini azaltmakta zorlanır mısın?', a:[
      ['Kolay azaltırım.',0],['Biraz zorlanırım.',1],['Zorlanırım.',2],['Çok zorlanırım.',3]
    ]},
    { cat:'Dijital', q:'Bildirim gelmese de sık kontrol eder misin?', a:[
      ['Hayır.',0],['Ara sıra.',1],['Sık sık.',2],['Sürekli kontrol ederim.',3]
    ]},
    // ALIŞVERİŞ/KUMAR
    { cat:'Alışveriş/Kumar', q:'Planladığından fazla para harcar mısın?', a:[
      ['Hayır.',0],['Nadiren.',1],['Bazen.',2],['Sıklıkla.',3]
    ]},
    { cat:'Alışveriş/Kumar', q:'Pişman olup “telafi/kayıp kovalamak” düşüncesi olur mu?', a:[
      ['Hayır.',0],['Ara sıra.',1],['Sık.',2],['Çoğu zaman.',3]
    ]},
    // GENEL
    { cat:'Genel', q:'“Kontrol bende” duygun ne kadar güçlü?', a:[
      ['Güçlü hissediyorum.',0],['Genelde iyi.',1],['Sık dalgalanıyor.',2],['Çoğu zaman zayıf.',3]
    ]},
    { cat:'Genel', q:'Zorlanmalarda sağlıklı başa çıkma yollarını kullanma sıklığın?', a:[
      ['Sıklıkla.',0],['Ara sıra.',1],['Nadiren.',2],['Zorlanırım.',3]
    ]}
  ];

  let i = 0;
  const picked = Array(questions.length).fill(null);

  // DOM
  const progressBar = $('#progress-bar');
  const qWrap = $('#question-container');
  const nextBtn = $('#next-btn');
  const prevBtn = $('#prev-btn');
  const restartBtn = $('#restart-btn');
  const result = $('#result-container');
  const qCounter = $('#question-counter');
  const catChip = $('#category-chip');
  const pctChip = $('#percent-chip');
  const history = $('#history-container');
  const historyList = $('#history-list');

  function updateProgress(){
    const answered = picked.filter(v=>v!==null).length;
    const pct = Math.round(answered / questions.length * 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (pctChip) pctChip.textContent = '%' + pct;
    if (qCounter) qCounter.textContent = `Soru ${i+1} / ${questions.length}`;
  }

  function renderQuestion(){
    const q = questions[i];
    if (catChip) catChip.textContent = q.cat;
    qWrap.innerHTML = `
      <p>${q.q}</p>
      <div class="options">
        ${q.a.map((pair,idx)=>`
          <button class="option ${picked[i]===idx?'selected':''}" data-i="${idx}">
            ${pair[0]}
          </button>
        `).join('')}
      </div>
    `;
    qWrap.querySelectorAll('.option').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const idx = Number(e.currentTarget.dataset.i);
        picked[i] = idx;
        qWrap.querySelectorAll('.option').forEach(b=>b.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        updateProgress();
      });
    });

    if (prevBtn) prevBtn.disabled = (i===0);
    if (nextBtn) nextBtn.textContent = (i===questions.length-1) ? 'Bitir' : 'Sonraki';
  }

  function computeStats(){
    const totals = {}, maxs = {};
    questions.forEach((q,idx)=>{
      const p = picked[idx];
      if (p===null) return;
      const score = q.a[p][1];
      totals[q.cat] = (totals[q.cat]||0) + score;
      maxs[q.cat] = (maxs[q.cat]||0) + 3;
    });
    const totalScore = Object.values(totals).reduce((a,b)=>a+b,0);
    const maxScore = questions.length * 3;
    const totalPct = Math.round(totalScore / maxScore * 100);
    const cats = Object.keys(maxs).map(cat=>{
      const pct = Math.round((totals[cat]||0) / maxs[cat] * 100);
      return { cat, pct };
    });
    return { totalPct, cats };
  }

  const level = p => p<=33 ? {label:'Düşük eğilim',tone:'good'} : (p<=66 ? {label:'Orta eğilim',tone:'mid'} : {label:'Yüksek eğilim',tone:'high'});

  function barsHTML(cats){
    return `
      <div class="bars">
        ${cats.map(c=>`
          <div class="bar">
            <div class="bar-top"><strong>${c.cat}</strong><span>${c.pct}%</span></div>
            <div class="bar-bg"><div class="bar-fill ${level(c.pct).tone}" style="width:${c.pct}%"></div></div>
            <p class="bar-note">${level(c.pct).label}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  function showResults(){
    const stats = computeStats();
    const lv = level(stats.totalPct);
    $('#quiz-container').style.display = 'none';
    result.style.display = 'block';
    result.innerHTML = `
      <h2>Genel Görünüm: ${lv.label} (${stats.totalPct}%)</h2>
      <p class="muted small">Bu sonuç teşhis değildir; farkındalık sağlar. Daha fazla destek için <a class="link" href="yardim.html">Yardım Al</a>.</p>
      ${barsHTML(stats.cats)}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
        <button id="save-result" class="btn btn-primary">Sonucumu Kaydet</button>
        <button id="restart-from-result" class="btn ghost">Testi Yeniden Başlat</button>
      </div>
    `;
    $('#restart-from-result')?.addEventListener('click', restart);
    $('#save-result')?.addEventListener('click', async ()=>{
      const payload = { at: nowISO(), totalPct: stats.totalPct, cats: stats.cats, from: 'test' };
      await DB.addResult(payload);       // veritabanına (şimdilik local)
      loadHistory();                     // yerel geçmişi yenile
      alert('Sonucunuz kaydedildi.');
       // 🔹 Ek olarak NeonDB'ye kaydet (Render API üzerinden)
fetch("https://kontrolsende-1.onrender.com/addResult", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    total_pct: stats.totalPct,
    cats: stats.cats
  })
})
  .then((res) => res.json())
  .then((data) => console.log("✅ NeonDB'ye kaydedildi:", data))
  .catch((err) => console.error("❌ NeonDB kaydı başarısız:", err));
    });
  }
  console.log("📤 API'ye gönderilen veri:", {
    total_pct: stats.totalPct,
    cats: stats.cats
  });

  fetch("https://kontrolsende-1.onrender.com/addResult", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      total_pct: stats.totalPct,
      cats: stats.cats
    })
  })
    .then((res) => {
      console.log("📡 API yanıt durumu:", res.status);
      return res.json();
    })
    .then((data) => {
      console.log("✅ API cevabı:", data);
      alert("✅ API'ye başarıyla gönderildi!");
    })
    .catch((err) => {
      console.error("❌ API gönderim hatası:", err);
      alert("⚠️ API'ye gönderim başarısız! Konsolu kontrol et.");
    });
  function loadHistory(){
    // Yereldeki (DB mock) sonuçların son 5 kaydını göster
    DB.getResults().then(list => {
      if (!list.length){ history.style.display='none'; return; }
      history.style.display='block';
      historyList.innerHTML = list.slice(0,5).map(it=>`
        <div class="history-item">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <strong>${new Date(it.at).toLocaleString()}</strong>
            <span class="pill">Genel: ${it.totalPct}%</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${it.cats.map(c=>`<span class="pill">${c.cat}: ${c.pct}%</span>`).join('')}
          </div>
        </div>
      `).join('');
    });
  }

  function next(){
    if (picked[i]===null){ alert('Lütfen bir seçenek seç.'); return; }
    if (i<questions.length-1){ i++; renderQuestion(); }
    else { showResults(); }
  }
  function prev(){ if(i>0){ i--; renderQuestion(); } }
  function restart(){
    for (let k=0;k<picked.length;k++) picked[k]=null;
    i=0; $('#quiz-container').style.display='block'; result.style.display='none';
    updateProgress(); renderQuestion(); window.scrollTo({top:0,behavior:'smooth'});
  }

  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);
  restartBtn?.addEventListener('click', restart);

  loadHistory(); updateProgress(); renderQuestion();
});

/* =========================
   4) ETKİNLİKLER SAYFASI (dinamik liste)
   ========================= */
document.addEventListener('DOMContentLoaded', async () => {
  const listEl = $('#event-list');
  if (!listEl) return; // etkinlikler sayfasında değiliz

  const events = await DB.getEvents();
  if (!events.length) {
    listEl.innerHTML = `<p class="muted">Henüz etkinlik yok.</p>`;
    return;
  }

  listEl.innerHTML = events.map(ev => `
    <article class="event-card">
      <div class="event-media">
        <img src="${ev.img}" alt="${ev.title}" loading="lazy">
      </div>
      <div class="event-meta">
        <span class="event-title">${ev.title}</span>
        <span class="tiny muted">${new Date(ev.at).toLocaleDateString()}</span>
      </div>
      <p class="event-desc">${ev.desc || ''}</p>
    </article>
  `).join('');
});

/* =========================
   5) ADMIN PANELİ
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const loginBox = $('#admin-login');
  const panelBox = $('#admin-panel');
  if (!loginBox || !panelBox) return; // admin sayfasında değiliz

  const ADMIN_PIN = '2468'; // ⚠️ değiştirilebilir

  const pinInput = $('#admin-pin');
  const enterBtn = $('#admin-enter');

  const tabEvents = $('#tab-events');
  const tabResults = $('#tab-results');
  const eventsPanel = $('#events-panel');
  const resultsPanel = $('#results-panel');

  // Giriş
  enterBtn.addEventListener('click', ()=>{
    const val = (pinInput.value||'').trim();
    if (val === ADMIN_PIN) {
      loginBox.style.display = 'none';
      panelBox.style.display = 'block';
      // Varsayılan sekme: etkinlikler
      tabEvents.classList.add('btn-primary'); tabResults.classList.remove('btn-primary'); tabResults.classList.add('ghost');
      eventsPanel.style.display='block'; resultsPanel.style.display='none';
      renderAdminEvents();
      renderAdminResults();
    } else {
      alert('Hatalı PIN');
    }
  });

  // Sekmeler
  tabEvents.addEventListener('click', ()=>{
    tabEvents.classList.add('btn-primary'); tabEvents.classList.remove('ghost');
    tabResults.classList.add('ghost'); tabResults.classList.remove('btn-primary');
    eventsPanel.style.display='block'; resultsPanel.style.display='none';
    renderAdminEvents();
  });
  tabResults.addEventListener('click', ()=>{
    tabResults.classList.add('btn-primary'); tabResults.classList.remove('ghost');
    tabEvents.classList.add('ghost'); tabEvents.classList.remove('btn-primary');
    eventsPanel.style.display='none'; resultsPanel.style.display='block';
    renderAdminResults();
  });

  // Etkinlik ekleme
  const titleIn = $('#event-title');
  const descIn  = $('#event-desc');
  const imgIn   = $('#event-img');
  const addBtn  = $('#add-event');
  addBtn.addEventListener('click', async ()=>{
    const title = (titleIn.value||'').trim();
    const desc  = (descIn.value||'').trim();
    const img   = (imgIn.value||'').trim();
    if (!title || !img) { alert('Başlık ve Görsel URL zorunlu.'); return; }
    await DB.addEvent({ title, desc, img });
    titleIn.value=''; descIn.value=''; imgIn.value='';
    renderAdminEvents();
    alert('Etkinlik eklendi.');
  });

  async function renderAdminEvents() {
    const list = await DB.getEvents();
    const wrap = $('#admin-event-list');
    if (!list.length) { wrap.innerHTML = `<p class="muted">Henüz etkinlik yok.</p>`; return; }
    wrap.innerHTML = list.map(ev=>`
      <article class="event-card">
        <div class="event-media"><img src="${ev.img}" alt="${ev.title}" loading="lazy"></div>
        <div class="event-meta"><span class="event-title">${ev.title}</span><span class="tiny muted">${new Date(ev.at).toLocaleDateString()}</span></div>
        <p class="event-desc">${ev.desc||''}</p>
        <div class="event-actions">
          <button class="btn ghost" data-del="${ev.id}">Sil</button>
        </div>
      </article>
    `).join('');
    // Silme
    $$('#admin-event-list [data-del]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-del');
        await DB.deleteEvent(id);
        renderAdminEvents();
      });
    });
  }

  async function renderAdminResults() {
    const list = await DB.getResults();
    const wrap = $('#admin-result-list');
    if (!list.length) { wrap.innerHTML = `<p class="muted">Kayıtlı sonuç yok.</p>`; return; }
    wrap.innerHTML = list.map(it=>`
      <div class="history-item">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <strong>${new Date(it.at).toLocaleString()}</strong>
          <span class="pill">Genel: ${it.totalPct}%</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${it.cats.map(c=>`<span class="pill">${c.cat}: ${c.pct}%</span>`).join('')}
        </div>
      </div>
    `).join('');

    // Toplu işlemler (isteğe bağlı): dışa aktar / temizle
    // Hızlı eklemek istersen:
    // <button id="export-json">JSON Dışa Aktar</button>
    // <button id="clear-results">Hepsini Sil</button>
    // Ama admin.html'de bu butonları eklememiştik — eklersen bu kod hazır:
    const exportBtn = $('#export-json');
    const clearBtn  = $('#clear-results');
    if (exportBtn) exportBtn.onclick = async ()=>{
      const data = await DB.getResults();
      const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `kontrolsende-sonuclar-${Date.now()}.json`;
      a.click(); URL.revokeObjectURL(url);
    };
    if (clearBtn) clearBtn.onclick = async ()=>{
      if (!confirm('Tüm sonuçlar silinsin mi?')) return;
      await DB.clearResults();
      renderAdminResults();
    };
  }
});
// Aktif sayfayı otomatik yeşil yap
document.addEventListener('DOMContentLoaded', () => {
  const current = location.pathname.split('/').pop(); // örn: 'test.html'
  document.querySelectorAll('.ks-drawer a').forEach(a=>{
    const href = a.getAttribute('href');
    if (href === current) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
});
/* =========================
   6) NOT: Firebase'e geçiş
   =========================
   - Geçmek istediğinde:
     1) Firebase SDK script'lerini HTML'e ekle
     2) Aşağıdaki fonksiyonu çağır:
        DB.initFirebase({
          apiKey: '...',
          authDomain: '...',
          databaseURL: '...',
          projectId: '...',
          storageBucket: '...',
          messagingSenderId: '...',
          appId: '...'
        });
     3) DB.getEvents / addEvent / getResults vs. içindeki
        "TODO" kısımlarını Firebase API çağrılarıyla doldur.
*/
