/* =========================================================
   KontrolSende • main.js (Clean Stable)
   - Glass menü (hamburger → X)
   - Test (quiz) + sonuç kaydı
   - Etkinlikler + Admin CRUD
   - LocalStorage (Mock DB)
   ========================================================= */

/* =========================
   0) Yardımcılar
   ========================= */
const $  = (sel,scope=document)=> scope.querySelector(sel);
const $$ = (sel,scope=document)=> scope.querySelectorAll(sel);

function uid() { return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36); }
function nowISO() { return new Date().toISOString(); }
function safeJSON(str, fallback) { try { return JSON.parse(str); } catch { return fallback; } }

/* =========================
   1) LocalStorage kontrolü (iOS uyumlu)
   ========================= */
try {
  localStorage.setItem('ks_test','1');
  localStorage.removeItem('ks_test');
} catch(e) {
  console.warn('⚠️ LocalStorage kullanılamıyor:', e);
}

/* =========================
   2) DB Katmanı (Mock → Firebase’e hazır)
   ========================= */
const DB = (() => {
  const KEYS = { events: 'ks_events', results: 'ks_results' };

  function ensureMockSeed() {
    const cur = safeJSON(localStorage.getItem(KEYS.events), []);
    if (!cur || cur.length === 0) {
      const seed = [
        { id: uid(), title:'Farkındalık Semineri', desc:'Sigara ve alkolün etkileri.',
          img:'https://images.unsplash.com/photo-1606761568499-6d2451b23c67?q=80&w=800', at: nowISO() },
        { id: uid(), title:'Dijital Detoks Atölyesi', desc:'Bildirim yönetimi, ekran süresi ipuçları.',
          img:'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800', at: nowISO() },
        { id: uid(), title:'Sporda Denge', desc:'Sağlıklı alışkanlıklar ve özdenetim.',
          img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800', at: nowISO() }
      ];
      localStorage.setItem(KEYS.events, JSON.stringify(seed));
    }
    if (!localStorage.getItem(KEYS.results))
      localStorage.setItem(KEYS.results, JSON.stringify([]));
  }

  async function getEvents(){ ensureMockSeed(); return safeJSON(localStorage.getItem(KEYS.events), []); }
  async function addEvent({ title, desc, img }){
    const list = safeJSON(localStorage.getItem(KEYS.events), []);
    const item = { id: uid(), title, desc, img, at: nowISO() };
    list.unshift(item);
    localStorage.setItem(KEYS.events, JSON.stringify(list));
    return item;
  }
  async function deleteEvent(id){
    const list = safeJSON(localStorage.getItem(KEYS.events), []);
    localStorage.setItem(KEYS.events, JSON.stringify(list.filter(e=>e.id!==id)));
  }

  async function addResult(result){
    const list = safeJSON(localStorage.getItem(KEYS.results), []);
    list.unshift(result);
    localStorage.setItem(KEYS.results, JSON.stringify(list));
  }
  async function getResults(){ return safeJSON(localStorage.getItem(KEYS.results), []); }
  async function clearResults(){ localStorage.setItem(KEYS.results, JSON.stringify([])); }

  return { getEvents, addEvent, deleteEvent, addResult, getResults, clearResults };
})();

/* =========================
   3) Navbar (Hamburger Menü)
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const header = $('#ks-header');
  const btn = $('#ks-hamburger');
  const drawer = $('#ks-drawer');
  if (!header || !btn || !drawer) return;

  const setOffset = ()=>{
    const h = header.offsetHeight || 64;
    document.documentElement.style.setProperty('--ks-offset', `${h}px`);
  };
  setOffset(); addEventListener('resize', setOffset);

  let backdrop = document.querySelector('.ks-backdrop');
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

  // Aktif sayfayı otomatik yeşil yap
  const current = location.pathname.split('/').pop() || 'index.html';
  drawer.querySelectorAll('a').forEach(a=>{
    if (a.getAttribute('href') === current) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });

  // ESC tuşu ile menü kapatma
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && drawer.classList.contains('ks-open')) close();
  });
});

/* =========================
   4) Test (Quiz)
   ========================= */
// 🔹 Test kodun tamamen aynı kalabilir; mantıksal hata yok.
// Eğer burada hata mesajı alıyorsan, sorular kısmında
// HTML element id'lerinin (`#quiz-container`, `#progress-bar` vs.)
// sayfada doğru tanımlandığından emin ol.

/* =========================
   5) Etkinlikler Sayfası
   ========================= */
document.addEventListener('DOMContentLoaded', async () => {
  const listEl = $('#event-list');
  if (!listEl) return;
  const events = await DB.getEvents();
  listEl.innerHTML = events.map(ev => `
    <article class="event-card">
      <div class="event-media"><img src="${ev.img}" alt="${ev.title}" loading="lazy"></div>
      <div class="event-meta">
        <strong>${ev.title}</strong>
        <span class="tiny muted">${new Date(ev.at).toLocaleDateString()}</span>
      </div>
      <p class="tiny">${ev.desc||''}</p>
    </article>
  `).join('');
});

/* =========================
   6) Admin Paneli
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const loginBox = $('#admin-login');
  const panelBox = $('#admin-panel');
  if (!loginBox || !panelBox) return;

  const ADMIN_PIN = '2468';
  const pinInput = $('#admin-pin');
  const enterBtn = $('#admin-enter');
  const tabEvents = $('#tab-events');
  const tabResults = $('#tab-results');
  const eventsPanel = $('#events-panel');
  const resultsPanel = $('#results-panel');

  enterBtn.addEventListener('click', ()=>{
    const val = pinInput.value.trim();
    if (val !== ADMIN_PIN) return alert('Hatalı PIN');
    loginBox.style.display='none';
    panelBox.style.display='block';
    tabEvents.classList.add('btn-primary');
    eventsPanel.style.display='block';
    renderAdminEvents(); renderAdminResults();
  });

  tabEvents.addEventListener('click', ()=>{
    tabEvents.classList.add('btn-primary'); tabResults.classList.remove('btn-primary');
    eventsPanel.style.display='block'; resultsPanel.style.display='none';
    renderAdminEvents();
  });
  tabResults.addEventListener('click', ()=>{
    tabResults.classList.add('btn-primary'); tabEvents.classList.remove('btn-primary');
    eventsPanel.style.display='none'; resultsPanel.style.display='block';
    renderAdminResults();
  });

  const titleIn=$('#event-title'), descIn=$('#event-desc'), imgIn=$('#event-img'), addBtn=$('#add-event');
  addBtn.addEventListener('click', async ()=>{
    const title=titleIn.value.trim(), desc=descIn.value.trim(), img=imgIn.value.trim();
    if(!title||!img) return alert('Başlık ve Görsel zorunlu.');
    await DB.addEvent({title,desc,img});
    titleIn.value=descIn.value=imgIn.value='';
    renderAdminEvents(); alert('Etkinlik eklendi.');
  });

  async function renderAdminEvents(){
    const list=await DB.getEvents(); const wrap=$('#admin-event-list');
    wrap.innerHTML=list.map(ev=>`
      <article class="event-card">
        <div class="event-media"><img src="${ev.img}" alt="${ev.title}" loading="lazy"></div>
        <div class="event-meta"><strong>${ev.title}</strong>
        <span class="tiny muted">${new Date(ev.at).toLocaleDateString()}</span></div>
        <p>${ev.desc||''}</p>
        <button class="btn ghost" data-del="${ev.id}">Sil</button>
      </article>`).join('');
    $$('#admin-event-list [data-del]').forEach(btn=>{
      btn.onclick=async()=>{await DB.deleteEvent(btn.dataset.del);renderAdminEvents();}
    });
  }

  async function renderAdminResults(){
    const list=await DB.getResults(); const wrap=$('#admin-result-list');
    wrap.innerHTML=list.map(it=>`
      <div class="history-item">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <strong>${new Date(it.at).toLocaleString()}</strong>
          <span class="pill">Genel: ${it.totalPct}%</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${it.cats.map(c=>`<span class="pill">${c.cat}: ${c.pct}%</span>`).join('')}
        </div>
      </div>`).join('');
  }
});
