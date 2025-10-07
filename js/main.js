// main.js'in en başına:
if (location.pathname.includes('admin.html')) {
  console.log('Admin sayfası: genel JS pasif');
  // Admin özel kodları harici dosyada çalışacak
  throw null; // geri kalan kodu durdurur
}
/* =========================================================
   KontrolSende • main.js (v5 – API entegre)
   - DB katmanı: Render API + NeonDB
   - Hamburger menü
   - Test (yalnızca test.html)
   - Etkinlikler (DB’den herkese açık)
   - Admin: Etkinlik Ekle/Sil + Sonuçları Gör/Sil + İstatistik/Grafikler
   ========================================================= */

/* =========================
   0) Yardımcılar
   ========================= */
const $  = (sel,scope=document)=> scope.querySelector(sel);
const $$ = (sel,scope=document)=> scope.querySelectorAll(sel);
const nowISO = () => new Date().toISOString();

/* =========================
   1) DB KATMANI (Gerçek API – Render)
   ========================= */
const API_BASE = "https://kontrolsende-api.onrender.com"; // Render URL’in

const DB = {
  // ---- EVENTS ----
  async getEvents() {
    const r = await fetch(`${API_BASE}/getEvents`);
    const j = await r.json().catch(()=>({success:false}));
    return j && j.success ? j.rows : [];
  },
  async addEvent({ title, desc, img }) {
    const r = await fetch(`${API_BASE}/addEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc || "", image_url: img })
    });
    const j = await r.json().catch(()=>({success:false}));
    return !!(j && j.success);
  },
  async deleteEvent(id) {
    const r = await fetch(`${API_BASE}/deleteEvent/${id}`, { method: "DELETE" });
    const j = await r.json().catch(()=>({success:false}));
    return !!(j && j.success);
  },

  // ---- RESULTS ----
  async addResult({ totalPct, cats }) {
    const r = await fetch(`${API_BASE}/addResult`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total_pct: totalPct, cats })
    });
    const j = await r.json().catch(()=>({success:false}));
    return !!(j && j.success);
  },
  async getResults() {
    const r = await fetch(`${API_BASE}/getResults`);
    const j = await r.json().catch(()=>({success:false, rows:[]}));
    return j && j.success
      ? j.rows.map(x => ({
          id: x.id,
          at: x.created_at,
          totalPct: x.total_pct,
          cats: x.cats
        }))
      : [];
  },
  async deleteResult(id) {
    const r = await fetch(`${API_BASE}/deleteResult/${id}`, { method:"DELETE" });
    const j = await r.json().catch(()=>({success:false}));
    return !!(j && j.success);
  }
};

/* =========================
   2) NAVBAR (Hamburger Menü)
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const header = $('#ks-header');
  const btn    = $('#ks-hamburger');
  const drawer = $('#ks-drawer');
  if (!header || !btn || !drawer) return;
   // Eğer admin sayfasındaysak HTML’e sınıf ekle
if (document.getElementById('admin-panel')) {
  document.documentElement.classList.add('page-admin');
}

// Başlangıçta menü simgesi temiz başlasın
btn.classList.remove('ks-active');
drawer.classList.remove('ks-open');
btn.setAttribute('aria-expanded','false');
   // İlk yüklemede temiz başla (bazı sayfalarda class kalıntısı olabiliyor)
btn.className = btn.className.replace('ks-active','');
drawer.className = drawer.className.replace('ks-open','');
btn.setAttribute('aria-expanded','false');
  const setOffset = () => {
    const h = header.offsetHeight || 64;
    document.documentElement.style.setProperty('--ks-offset', `${h}px`);
  };
  setOffset(); addEventListener('resize', setOffset);

  // Backdrop
  let backdrop = $('.ks-backdrop');
  if (!backdrop){
    backdrop = document.createElement('div');
    backdrop.className = 'ks-backdrop';
    document.body.appendChild(backdrop);
  }

  const open = ()=>{
    drawer.classList.add('ks-open');
    btn.classList.add('ks-active');
    btn.setAttribute('aria-expanded','true');
    backdrop.classList.add('ks-show');
    document.documentElement.style.overflow='hidden';
  };
  const close = ()=>{
    drawer.classList.remove('ks-open');
    btn.classList.remove('ks-active');
    btn.setAttribute('aria-expanded','false');
    backdrop.classList.remove('ks-show');
    document.documentElement.style.overflow='';
  };
  const toggle = ()=> drawer.classList.contains('ks-open') ? close() : open();

  btn.addEventListener('click', toggle);
  backdrop.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a=> a.addEventListener('click', close));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && drawer.classList.contains('ks-open')) close(); });

  // Aktif sayfa vurgusu
  const current = location.pathname.split('/').pop() || 'index.html';
  drawer.querySelectorAll('a').forEach(a=>{
    if (a.getAttribute('href') === current) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
});

/* =========================
   3) TEST (quiz) — sadece test.html
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const isTestPage = /(^|\/)test\.html(\?|#|$)/.test(location.pathname + location.search + location.hash);
  if (!isTestPage) return;

  const quizContainer = $('#quiz-container');
  if (!quizContainer) return;

  const qWrap       = $('#question-container');
  const nextBtn     = $('#next-btn');
  const prevBtn     = $('#prev-btn');
  const resultBox   = $('#result-container');
  const progressBar = $('#progress-bar');
  const qCounter    = $('#question-counter');
  const catChip     = $('#category-chip');
  const pctChip     = $('#percent-chip');
  const historyBox  = $('#history-container');
  const historyList = $('#history-list');
  if (!qWrap || !nextBtn || !prevBtn || !resultBox) return;

  const questions = [
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
    { cat:'Alışveriş/Kumar', q:'Planladığından fazla para harcar mısın?', a:[
      ['Hayır.',0],['Nadiren.',1],['Bazen.',2],['Sıklıkla.',3]
    ]},
    { cat:'Alışveriş/Kumar', q:'Pişman olup “telafi/kayıp kovalamak” düşüncesi olur mu?', a:[
      ['Hayır.',0],['Ara sıra.',1],['Sık.',2],['Çoğu zaman.',3]
    ]},
    { cat:'Genel', q:'“Kontrol bende” duygun ne kadar güçlü?', a:[
      ['Güçlü hissediyorum.',0],['Genelde iyi.',1],['Sık dalgalanıyor.',2],['Çoğu zaman zayıf.',3]
    ]},
    { cat:'Genel', q:'Zorlanmalarda sağlıklı başa çıkma yollarını kullanma sıklığın?', a:[
      ['Sıklıkla.',0],['Ara sıra.',1],['Nadiren.',2],['Zorlanırım.',3]
    ]}
  ];

  let i = 0;
  const picked = Array(questions.length).fill(null);

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

    prevBtn.disabled = (i===0);
    nextBtn.textContent = (i===questions.length-1) ? 'Bitir' : 'Sonraki';
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
    const maxScore   = questions.length * 3;
    const totalPct   = Math.round(totalScore / maxScore * 100);
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
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <h2>Genel Görünüm: ${lv.label} (${stats.totalPct}%)</h2>
      <p class="muted small">Bu sonuç teşhis değildir; farkındalık sağlar. Daha fazla destek için <a class="link" href="yardim.html">Yardım Al</a>.</p>
      ${barsHTML(stats.cats)}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
        <button id="save-result" class="btn btn-primary">Sonucumu Kaydet</button>
        <button id="restart-from-result" class="btn ghost">Testi Yeniden Başlat</button>
      </div>
    `;

    $('#restart-from-result')?.addEventListener('click', restart);

    const saveBtn = $('#save-result');
    if (saveBtn) saveBtn.addEventListener('click', async ()=>{
      const latest = computeStats(); // en güncel state
      const ok = await DB.addResult({ totalPct: latest.totalPct, cats: latest.cats });
      if (ok) { loadHistory(); alert('Sonucunuz kaydedildi.'); }
      else { alert('Kaydetme başarısız. Lütfen tekrar deneyin.'); }
    });
  }

  function loadHistory(){
    DB.getResults().then(list=>{
      if (!list.length){ historyBox.style.display='none'; return; }
      historyBox.style.display='block';
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
    if (i < questions.length - 1){ i++; renderQuestion(); }
    else { showResults(); }
  }
  function prev(){ if (i>0){ i--; renderQuestion(); } }
  function restart(){
    for (let k=0;k<picked.length;k++) picked[k]=null;
    i=0; $('#quiz-container').style.display='block'; resultBox.style.display='none';
    updateProgress(); renderQuestion(); window.scrollTo({top:0,behavior:'smooth'});
  }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  loadHistory(); updateProgress(); renderQuestion();
});

/* =========================
   4) ETKİNLİKLER SAYFASI (API'den liste)
   ========================= */
// Yardımcı: YouTube/Vimeo linkini embed’e çevir
function toEmbed(url){
  if (!url) return null;
  try{
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/','');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  }catch{ return null; }
}

function mediaHTML(ev){
  const img = ev.image_url;
  const vid = ev.video_url;

  if (vid) {
    // .mp4 gibi direkt video dosyası
    if (/\.(mp4|webm|ogg)$/i.test(vid)) {
      // poster olarak image_url kullanır (varsa)
      const poster = img ? ` poster="${img}"` : '';
      return `
        <video controls playsinline${poster} style="width:100%;height:100%;object-fit:cover;border-radius:12px;">
          <source src="${vid}">
          Tarayıcınız video öğesini desteklemiyor.
        </video>
      `;
    }
    // YouTube/Vimeo ise iframe embed
    const emb = toEmbed(vid);
    if (emb) {
      return `
        <iframe
          src="${emb}"
          title="Etkinlik videosu"
          style="width:100%;height:100%;border:0;border-radius:12px;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          loading="lazy"></iframe>
      `;
    }
  }

  // Video yoksa görseli göster
  if (img) {
    return `<img src="${img}" alt="${ev.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:12px;">`;
  }

  // Hiçbiri yoksa boş placeholder
  return `<div style="width:100%;height:100%;display:grid;place-items:center;color:#667085">Medya yok</div>`;
}

// ... events fetch ettikten sonra listEl.innerHTML üretiminde:
listEl.innerHTML = events.map(ev => `
  <article class="event-card">
    <div class="event-media">
      ${mediaHTML(ev)}
    </div>
    <div class="event-meta">
      <span class="event-title">${ev.title}</span>
      <span class="tiny muted">${ev.created_at ? new Date(ev.created_at).toLocaleDateString() : ''}</span>
    </div>
    <p class="event-desc">${ev.description || ''}</p>
  </article>
`).join('');
/* =========================
   5) ADMIN PANELİ
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const loginBox = $('#admin-login');
  const panelBox = $('#admin-panel');
  if (!loginBox || !panelBox) return;

  const ADMIN_PIN = '29391354'; // PIN sayfada gösterilmiyor
  const pinInput = $('#admin-pin');
  const enterBtn = $('#admin-enter');

  const tabEvents = $('#tab-events');
  const tabResults = $('#tab-results');
  const eventsPanel = $('#events-panel');
  const resultsPanel = $('#results-panel');

  // === İstatistik/Grafik yardımcıları ===
  function buildStats(rows){
    const total = rows.length;
    const avg = total ? Math.round(rows.reduce((s,r)=>s+(r.totalPct||r.total_pct||0),0)/total) : 0;

    const todayStr = new Date().toLocaleDateString();
    let today = 0, week = 0;
    const dayCounts = {};
    const days = [];
    for (let d=6; d>=0; d--){
      const dt = new Date(); dt.setDate(dt.getDate()-d);
      const key = dt.toLocaleDateString();
      days.push(key); dayCounts[key]=0;
    }

    const catsAgg = {};

    rows.forEach(r=>{
      const at = new Date(r.at || r.created_at);
      const dkey = at.toLocaleDateString();
      if (dkey === todayStr) today++;
      if (days.includes(dkey)) dayCounts[dkey]++;
      const diff = (Date.now() - at.getTime()) / 86400000;
      if (diff <= 7) week++;

      (r.cats||[]).forEach(c=>{
        const k = c.cat || c.category || 'Diğer';
        if (!catsAgg[k]) catsAgg[k] = { sum:0, count:0 };
        catsAgg[k].sum += Number(c.pct||0);
        catsAgg[k].count += 1;
      });
    });

    const catLabels = Object.keys(catsAgg);
    const catValues = catLabels.map(k => Math.round(catsAgg[k].sum / catsAgg[k].count));
    const trendLabels = days;
    const trendValues = days.map(k=>dayCounts[k]||0);

    return { total, avg, today, week, catLabels, catValues, trendLabels, trendValues };
  }

  async function ensureChartJs(){
    if (window.Chart) return;
    await new Promise(res=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
      s.onload=res; document.head.appendChild(s);
    });
  }

  let chartCats, chartTrend;
  async function renderAdminDashboard(){
    const rows = await DB.getResults();
    const { total, avg, today, week, catLabels, catValues, trendLabels, trendValues } = buildStats(rows);

    const $id = id => document.getElementById(id);
    if ($id('stat-total')) $id('stat-total').textContent = String(total);
    if ($id('stat-avg'))   $id('stat-avg').textContent   = (avg||0) + '%';
    if ($id('stat-today')) $id('stat-today').textContent = String(today);
    if ($id('stat-week'))  $id('stat-week').textContent  = String(week);

    await ensureChartJs();

    const ctx1 = document.getElementById('chart-cats');
    if (ctx1){
      chartCats && chartCats.destroy();
      chartCats = new Chart(ctx1, {
        type: 'bar',
        data: { labels: catLabels, datasets: [{ label: 'Ortalama %', data: catValues }] },
        options: { responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, max:100 } } }
      });
    }

    const ctx2 = document.getElementById('chart-trend');
    if (ctx2){
      chartTrend && chartTrend.destroy();
      chartTrend = new Chart(ctx2, {
        type: 'line',
        data: { labels: trendLabels, datasets: [{ label: 'Test Adedi', data: trendValues, tension:.35, fill:false }] },
        options: { responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, precision:0 } } }
      });
    }
  }

  // === Giriş ===
  enterBtn.addEventListener('click', ()=>{
    const val = (pinInput.value||'').trim();
    if (val !== ADMIN_PIN) return alert('Hatalı PIN');
    loginBox.style.display='none';
    panelBox.style.display='block';
    tabEvents.classList.add('btn-primary');
    eventsPanel.style.display='block'; resultsPanel.style.display='none';
    renderAdminEvents(); renderAdminResults(); renderAdminDashboard();
  });

  // === Sekmeler ===
  tabEvents?.addEventListener('click', ()=>{
    tabEvents.classList.add('btn-primary'); tabResults.classList.remove('btn-primary');
    eventsPanel.style.display='block'; resultsPanel.style.display='none';
    renderAdminEvents();
  });
  tabResults?.addEventListener('click', ()=>{
    tabResults.classList.add('btn-primary'); tabEvents.classList.remove('btn-primary');
    eventsPanel.style.display='none'; resultsPanel.style.display='block';
    renderAdminResults(); renderAdminDashboard();
  });

  // === Etkinlik ekleme ===
  const titleIn = $('#event-title');
  const descIn  = $('#event-desc');
  const imgIn   = $('#event-img');
  const addBtn  = $('#add-event');

  addBtn?.addEventListener('click', async ()=>{
    const title = (titleIn.value||'').trim();
    const desc  = (descIn.value||'').trim();
    const img   = (imgIn.value||'').trim();
    if (!title || !img) return alert('Başlık ve Görsel URL zorunlu.');
    const ok = await DB.addEvent({ title, desc, img });
    if (ok) { titleIn.value=''; descIn.value=''; imgIn.value=''; renderAdminEvents(); alert('Etkinlik eklendi.'); }
    else alert('Eklenemedi. Lütfen tekrar deneyin.');
  });

  // === Admin: Etkinlik listesi + silme ===
  async function renderAdminEvents(){
    const wrap = $('#admin-event-list');
    const list = await DB.getEvents();
    wrap.innerHTML = !list.length ? `<p class="muted">Henüz etkinlik yok.</p>` :
      list.map(ev=>`
        <article class="event-card">
          <div class="event-media"><img src="${ev.image_url}" alt="${ev.title}" loading="lazy"></div>
          <div class="event-meta">
            <span class="event-title">${ev.title}</span>
            <span class="tiny muted">${new Date(ev.created_at).toLocaleDateString()}</span>
          </div>
          <p class="event-desc">${ev.description||''}</p>
          <div class="event-actions"><button class="btn ghost" data-del="${ev.id}">Sil</button></div>
        </article>
      `).join('');

    $$('#admin-event-list [data-del]').forEach(btn=>{
      btn.onclick = async ()=>{
        const id = btn.getAttribute('data-del');
        if (!confirm('Silinsin mi?')) return;
        const ok = await DB.deleteEvent(id);
        if (ok) renderAdminEvents(); else alert('Silme başarısız.');
      };
    });
  }

  // === Admin: Sonuç listesi + tek tek silme ===
  async function renderAdminResults(){
    const wrap = $('#admin-result-list');
    const list = await DB.getResults();

    if (!list.length) {
      wrap.innerHTML = `<p class="muted">Kayıtlı sonuç yok.</p>`;
      return;
    }

    wrap.innerHTML = list.map(it=>`
      <div class="history-item">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <strong>${new Date(it.at).toLocaleString()}</strong>
          <div style="display:flex;gap:6px;align-items:center">
            <span class="pill">Genel: ${it.totalPct}%</span>
            <button class="btn ghost" data-del-result="${it.id}">Sil</button>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${it.cats.map(c=>`<span class="pill">${c.cat}: ${c.pct}%</span>`).join('')}
        </div>
      </div>
    `).join('');

    $$('#admin-result-list [data-del-result]').forEach(btn=>{
      btn.onclick = async ()=>{
        const id = Number(btn.getAttribute('data-del-result'));
        if (!confirm('Bu sonucu silmek istiyor musun?')) return;
        const ok = await DB.deleteResult(id);
        if (ok) { renderAdminResults(); renderAdminDashboard(); }
        else { alert('Silme başarısız.'); }
      };
    });
  }
});
