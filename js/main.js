// ===== NAV: hamburger + backdrop + iOS hizalama =====
document.addEventListener('DOMContentLoaded', () => {
  const btn  = document.getElementById('hamburger');
  const list = document.getElementById('navLinks');
  if (!btn || !list) return;

  // Header yüksekliğini ölç → menü üst boşluğuna uygula (iOS hizası)
  const header = document.querySelector('.site-header');
  const setNavOffset = () => {
    const h = header?.offsetHeight || 64;
    document.documentElement.style.setProperty('--nav-offset', `${h}px`);
  };
  setNavOffset();
  window.addEventListener('resize', setNavOffset);

  // Backdrop'u oluştur
  let backdrop = document.getElementById('menu-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'menu-backdrop';
    backdrop.className = 'menu-backdrop';
    document.body.appendChild(backdrop);
  }

  const openMenu = ()=>{
    list.classList.add('show');
    btn.classList.add('active');
    btn.setAttribute('aria-expanded','true');
    backdrop.classList.add('show');
    document.body.classList.add('no-scroll');
  };
  const closeMenu = ()=>{
    list.classList.remove('show');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded','false');
    backdrop.classList.remove('show');
    document.body.classList.remove('no-scroll');
  };
  const toggleMenu = ()=> list.classList.contains('show') ? closeMenu() : openMenu();

  // Etkileşimler
  btn.addEventListener('click', toggleMenu);
  btn.addEventListener('touchend', (e)=>{ e.preventDefault(); toggleMenu(); });
  backdrop.addEventListener('click', closeMenu);
  document.addEventListener('click', (e)=>{
    if (!list.classList.contains('show')) return;
    const inside = list.contains(e.target) || btn.contains(e.target);
    if (!inside) closeMenu();
  });
  list.querySelectorAll('a').forEach(a=> a.addEventListener('click', closeMenu));
});

// ===== Tema seçici (tüm sayfalarda) =====
(function initTheme(){
  const root = document.documentElement;
  const KEY  = 'ks-theme';
  const apply = t=>{
    root.classList.remove('theme-green','theme-dark','theme-glass');
    root.classList.add(t);
    localStorage.setItem(KEY,t);
  };
  apply(localStorage.getItem(KEY) || 'theme-green');
  const sync = ()=>{
    document.querySelectorAll('#themeSwitcher').forEach(sel=>{
      sel.value = localStorage.getItem(KEY) || 'theme-green';
      sel.onchange = e=> apply(e.target.value);
    });
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',sync); else sync();
})();

// ===== QUIZ (yalnız test.html'de çalışır) =====
document.addEventListener('DOMContentLoaded', () => {
  const quizContainer = document.getElementById('quiz-container');
  if (!quizContainer) return;

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
  const progressBar = document.getElementById('progress-bar');
  const qWrap = document.getElementById('question-container');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const restartBtn = document.getElementById('restart-btn');
  const result = document.getElementById('result-container');
  const qCounter = document.getElementById('question-counter');
  const catChip = document.getElementById('category-chip');
  const pctChip = document.getElementById('percent-chip');
  const history = document.getElementById('history-container');
  const historyList = document.getElementById('history-list');

  function updateProgress(){
    const answered = picked.filter(v=>v!==null).length;
    const pct = Math.round(answered / questions.length * 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (pctChip) pctChip.textContent = '%' + pct;
  }

  function renderQuestion(){
    const q = questions[i];
    if (qCounter) qCounter.textContent = `Soru ${i+1} / ${questions.length}`;
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
  function advice(cat,p){
    const tone = level(p).tone;
    const base = {good:'Denge iyi. Böyle devam.', mid:'Küçük sınırlar koy.', high:'Rehber öğretmenle konuşmak iyi gelir.'};
    const map = {
      'Sigara':{good:'“Hayır” deme kasını koru.', mid:'Tetikleyici ortamlardan uzak dur.', high:'Bırakma planını konuş.'},
      'Alkol':{good:'Sınırlarını koru.', mid:'Önceden kadeh sınırı belirle.', high:'Duygu düzenleme desteği al.'},
      'Dijital':{good:'Süre dengesi iyi.', mid:'Bildirim sessizlerini dene.', high:'Günlük süre hedefi koy.'},
      'Alışveriş/Kumar':{good:'Bütçe planı iyi.', mid:'Listeyle alışveriş yap.', high:'Harcamaları kısıtla, destek al.'},
      'Genel':{good:'Başa çıkma becerilerin çalışıyor.', mid:'Nefes/yürüyüş/yazma dene.', high:'Küçük hedefler belirle.'}
    };
    return (map[cat] && map[cat][tone]) || base[tone];
  }

  function barsHTML(cats){
    return `
      <div class="bars">
        ${cats.map(c=>`
          <div class="bar">
            <div class="bar-top"><strong>${c.cat}</strong><span>${c.pct}%</span></div>
            <div class="bar-bg"><div class="bar-fill ${level(c.pct).tone}" style="width:${c.pct}%"></div></div>
            <p class="bar-note">${level(c.pct).label}. ${advice(c.cat,c.pct)}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  function showResults(){
    const stats = computeStats();
    const lv = level(stats.totalPct);
    quizContainer.style.display = 'none';
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
    document.getElementById('restart-from-result')?.addEventListener('click', restart);
    document.getElementById('save-result')?.addEventListener('click', ()=>{
      const key='ks-results';
      const list = JSON.parse(localStorage.getItem(key)||'[]');
      list.unshift({at:new Date().toISOString(), totalPct:stats.totalPct, cats:stats.cats});
      localStorage.setItem(key, JSON.stringify(list));
      loadHistory();
      alert('Sonucunuz kaydedildi (bu cihazda).');
    });
  }

  function loadHistory(){
    const list = JSON.parse(localStorage.getItem('ks-results')||'[]');
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
  }

  function next(){
    if (picked[i]===null){ alert('Lütfen bir seçenek seç.'); return; }
    if (i<questions.length-1){ i++; renderQuestion(); }
    else { showResults(); }
  }
  function prev(){ if(i>0){ i--; renderQuestion(); } }
  function restart(){
    for (let k=0;k<picked.length;k++) picked[k]=null;
    i=0; quizContainer.style.display='block'; result.style.display='none';
    updateProgress(); renderQuestion(); window.scrollTo({top:0,behavior:'smooth'});
  }

  // Events
  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);
  restartBtn?.addEventListener('click', restart);

  // Init
  loadHistory(); updateProgress(); renderQuestion();
});
/* ===== KS NAV HOTFIX v3 ===== */
(function(){
  if (document.body.dataset.ksNav === 'on') return; // tekrar init etme
  document.body.dataset.ksNav = 'on';

  // 1) Elemanları bul / yoksa düzelt-oluştur
  const header = document.querySelector('.site-header') || (()=> {
    const h = document.createElement('header'); h.className='site-header';
    const nav = document.createElement('nav'); nav.className='container nav';
    const logo = document.createElement('a'); logo.className='logo'; logo.href='index.html'; logo.textContent='KontrolSende';
    nav.appendChild(logo); h.appendChild(nav); document.body.prepend(h);
    return h;
  })();
  const nav = header.querySelector('.nav') || header.querySelector('nav');

  // Hamburger: varsa kullan, yoksa oluştur
  let btn = header.querySelector('#hamburger') || header.querySelector('.hamburger');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'hamburger'; btn.className='hamburger'; btn.setAttribute('aria-label','Menüyü aç/kapat'); btn.setAttribute('aria-expanded','false');
    btn.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(btn);
  } else {
    btn.id = 'hamburger'; btn.classList.add('hamburger');
    if (!btn.innerHTML.trim()) btn.innerHTML = '<span></span><span></span><span></span>';
  }

  // Menü listesi: farklı adlandırılmış olabilir → normalize et
  let list = header.querySelector('#navLinks') || header.querySelector('.nav-links') || header.querySelector('ul');
  if (!list) {
    list = document.createElement('ul');
    list.innerHTML = `
      <li><a href="index.html">Ana Sayfa</a></li>
      <li><a href="test.html">Test Et</a></li>
      <li><a href="etkinlikler.html">Etkinlikler</a></li>
      <li><a href="yardim.html">Yardım Al</a></li>
      <li class="theme-li">
        <label for="themeSwitcher" class="theme-label">Tema</label>
        <select id="themeSwitcher" class="theme-select" aria-label="Tema seç">
          <option value="theme-green">Modern Yeşil</option>
          <option value="theme-dark">Koyu Derin</option>
          <option value="theme-glass">Glass / Gradient</option>
        </select>
      </li>`;
    nav.appendChild(list);
  }
  list.id = 'navLinks'; list.classList.add('nav-links');

  // 2) Header yüksekliğini ölç → menü üst boşluğu (iOS hizası)
  const setNavOffset = ()=>{
    const h = header?.offsetHeight || 64;
    document.documentElement.style.setProperty('--nav-offset', `${h}px`);
  };
  setNavOffset(); window.addEventListener('resize', setNavOffset);

  // 3) Backdrop'u bir kere ekle
  let backdrop = document.getElementById('menu-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'menu-backdrop'; backdrop.className = 'menu-backdrop';
    document.body.appendChild(backdrop);
  }

  // 4) Aç/Kapat
  const openMenu = ()=>{
    list.classList.add('show');
    btn.classList.add('active');
    btn.setAttribute('aria-expanded','true');
    backdrop.classList.add('show');
    document.body.classList.add('no-scroll');
  };
  const closeMenu = ()=>{
    list.classList.remove('show');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded','false');
    backdrop.classList.remove('show');
    document.body.classList.remove('no-scroll');
  };
  const toggleMenu = ()=> list.classList.contains('show') ? closeMenu() : openMenu();

  // 5) Etkileşimler (tüm kenar durumları)
  btn.addEventListener('click', toggleMenu);
  btn.addEventListener('touchend', (e)=>{ e.preventDefault(); toggleMenu(); });
  backdrop.addEventListener('click', closeMenu);
  document.addEventListener('click', (e)=>{
    if (!list.classList.contains('show')) return;
    const inside = list.contains(e.target) || btn.contains(e.target);
    if (!inside) closeMenu();
  });
  list.querySelectorAll('a').forEach(a=> a.addEventListener('click', closeMenu));

  // 6) Tema seçici senkronizasyonu (varsa)
  const root = document.documentElement; const KEY = 'ks-theme';
  const apply = t=>{
    root.classList.remove('theme-green','theme-dark','theme-glass');
    root.classList.add(t); localStorage.setItem(KEY,t);
  };
  apply(localStorage.getItem(KEY)||'theme-green');
  const sync = ()=>{
    header.querySelectorAll('#themeSwitcher').forEach(sel=>{
      sel.value = localStorage.getItem(KEY)||'theme-green';
      sel.onchange = e=> apply(e.target.value);
    });
  };
  sync();

  // 7) Teşhis (istersen konsolda gör)
  console.log('[KS] NAV HOTFIX v3 → hamburger:', !!btn, 'navLinks:', !!list);
})();
