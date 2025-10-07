const $=(s,sc=document)=>sc.querySelector(s); const $$=(s,sc=document)=>sc.querySelectorAll(s);
const API = window.API_BASE || '';

/* NAV */
document.addEventListener('DOMContentLoaded',()=>{
  const header=$('#ks-header'), btn=$('#ks-hamburger'), drawer=$('#ks-drawer');
  if(!header||!btn||!drawer) return;
  const setOff=()=>document.documentElement.style.setProperty('--ks-offset', `${header.offsetHeight||56}px`);
  setOff(); addEventListener('resize', setOff);

  let backdrop=$('.ks-backdrop'); if(!backdrop){backdrop=document.createElement('div');backdrop.className='ks-backdrop';document.body.appendChild(backdrop);}
  const open=()=>{drawer.classList.add('ks-open');btn.classList.add('ks-active');btn.setAttribute('aria-expanded','true');backdrop.classList.add('ks-show');document.documentElement.style.overflow='hidden';}
  const close=()=>{drawer.classList.remove('ks-open');btn.classList.remove('ks-active');btn.setAttribute('aria-expanded','false');backdrop.classList.remove('ks-show');document.documentElement.style.overflow='';}
  btn.addEventListener('click',()=>drawer.classList.contains('ks-open')?close():open());
  backdrop.addEventListener('click',close); drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));

  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  drawer.querySelectorAll('a').forEach(a=>{const href=(a.getAttribute('href')||'').toLowerCase(); if(href===current)a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');});
});

/* TEST (yalnız test.html) */
document.addEventListener('DOMContentLoaded',()=>{
  const qc=$('#quiz-container'); if(!qc) return;
  const questions=[
    {cat:'Sigara',q:'Sigara içme düşüncesi gün içinde ne sıklıkla aklına geliyor?',a:[['Hiç gelmiyor.',0],['Ara sıra.',1],['Sık aklıma geliyor.',2],['Çoğu zaman.',3]]},
    {cat:'Alkol',q:'Moralin bozukken alkolü çözüm gibi görür müsün?',a:[['Hayır.',0],['Bazen.',1],['Çoğu zaman.',2],['Genelde ilk.',3]]},
    {cat:'Dijital',q:'Ekran süresini azaltmakta zorlanır mısın?',a:[['Kolay.',0],['Biraz.',1],['Zorlanırım.',2],['Çok zor.',3]]},
    {cat:'Genel',q:'“Kontrol bende” duygun ne kadar güçlü?',a:[['Güçlü.',0],['Genelde iyi.',1],['Dalgalı.',2],['Zayıf.',3]]}
  ];
  let i=0; const picked=Array(questions.length).fill(null);
  const qWrap=$('#question-container'), nextBtn=$('#next-btn'), prevBtn=$('#prev-btn'), restartBtn=$('#restart-btn'), result=$('#result-container'), qCounter=$('#question-counter'), catChip=$('#category-chip'), pctChip=$('#percent-chip'), progressBar=$('#progress-bar'), history=$('#history-container'), historyList=$('#history-list');

  const level=p=>p<=33?{label:'Düşük eğilim',tone:'good'}:(p<=66?{label:'Orta eğilim',tone:'mid'}:{label:'Yüksek eğilim',tone:'high'});
  const barsHTML=cats=>`<div class="bars">${cats.map(c=>`
    <div class="bar">
      <div class="bar-top"><strong>${c.cat}</strong><span>${c.pct}%</span></div>
      <div class="bar-bg"><div class="bar-fill ${level(c.pct).tone}" style="width:${c.pct}%"></div></div>
      <p class="bar-note">${level(c.pct).label}</p>
    </div>`).join('')}</div>`;

  function updateProgress(){const answered=picked.filter(v=>v!==null).length; const pct=Math.round(answered/questions.length*100); if(progressBar)progressBar.style.width=pct+'%'; if(pctChip)pctChip.textContent='%'+pct; if(qCounter)qCounter.textContent=`Soru ${i+1} / ${questions.length}`;}
  function renderQuestion(){const q=questions[i]; if(catChip)catChip.textContent=q.cat; qWrap.innerHTML=`
    <p>${q.q}</p><div class="options">
      ${q.a.map((pair,idx)=>`<button class="option ${picked[i]===idx?'selected':''}" data-i="${idx}">${pair[0]}</button>`).join('')}
    </div>`;
    qWrap.querySelectorAll('.option').forEach(btn=>btn.addEventListener('click',e=>{const idx=Number(e.currentTarget.dataset.i); picked[i]=idx; qWrap.querySelectorAll('.option').forEach(b=>b.classList.remove('selected')); e.currentTarget.classList.add('selected'); updateProgress();}));
    if(prevBtn) prevBtn.disabled=(i===0); if(nextBtn) nextBtn.textContent=(i===questions.length-1)?'Bitir':'Sonraki';
  }
  function computeStats(){const totals={}, maxs={}; questions.forEach((q,idx)=>{const p=picked[idx]; if(p===null) return; const score=q.a[p][1]; totals[q.cat]=(totals[q.cat]||0)+score; maxs[q.cat]=(maxs[q.cat]||0)+3;});
    const totalScore=Object.values(totals).reduce((a,b)=>a+b,0); const maxScore=questions.length*3; const totalPct=Math.round(totalScore/maxScore*100);
    const cats=Object.keys(maxs).map(cat=>({cat,pct:Math.round((totals[cat]||0)/maxs[cat]*100)})); return {totalPct,cats};}
  function showResults(){const stats=computeStats(); const lv=level(stats.totalPct); $('#quiz-container').style.display='none'; result.style.display='block';
    result.innerHTML=`<h2>Genel Görünüm: ${lv.label} (${stats.totalPct}%)</h2>
      <p class="muted small">Bu sonuç teşhis değildir; farkındalık sağlar. Daha fazla destek için <a class="link" href="yardim.html">Yardım Al</a>.</p>
      ${barsHTML(stats.cats)}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
        <button id="save-result" class="btn btn-primary">Sonucumu Kaydet</button>
        <button id="restart-from-result" class="btn ghost">Testi Yeniden Başlat</button>
      </div>`;
    $('#restart-from-result')?.addEventListener('click', restart);
    $('#save-result')?.addEventListener('click', async ()=>{
      try{
        await fetch(`${API}/addResult`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({total_pct:stats.totalPct,cats:stats.cats})});
        alert('Sonucunuz kaydedildi.');
        loadHistory();
      }catch(e){ alert('Sunucuya kaydedilemedi.'); }
    });
  }
  function loadHistory(){history.style.display='none'; historyList.innerHTML=''; /* (isteğe bağlı: sadece yerel gösterim yapılabilirdi) */}
  function next(){if(picked[i]===null){alert('Lütfen bir seçenek seç.');return;} if(i<questions.length-1){i++;renderQuestion();} else {showResults();}}
  function prev(){if(i>0){i--;renderQuestion();}}
  function restart(){for(let k=0;k<picked.length;k++) picked[k]=null; i=0; $('#quiz-container').style.display='block'; result.style.display='none'; updateProgress(); renderQuestion(); window.scrollTo({top:0,behavior:'smooth'});}

  nextBtn?.addEventListener('click',next); prevBtn?.addEventListener('click',prev); restartBtn?.addEventListener('click',restart);
  updateProgress(); renderQuestion();
});

/* ETKİNLİKLER (etkinlikler.html) */
function toEmbed(url){ if(!url) return null; try{ const u=new URL(url);
  if(u.hostname.includes('youtube.com')){const v=u.searchParams.get('v'); if(v) return `https://www.youtube.com/embed/${v}`;}
  if(u.hostname==='youtu.be'){const id=u.pathname.replace('/',''); if(id) return `https://www.youtube.com/embed/${id}`;}
  if(u.hostname.includes('vimeo.com')){const id=u.pathname.split('/').filter(Boolean)[0]; if(id) return `https://player.vimeo.com/video/${id}`;}
  return null; }catch{ return null; } }
function mediaHTML(ev){ const img=ev.image_url, vid=ev.video_url;
  if(vid){ if(/\.(mp4|webm|ogg)$/i.test(vid)){ const poster=img?` poster="${img}"`:''; return `<video controls playsinline${poster} style="width:100%;height:100%;object-fit:cover;border-radius:12px;display:block"><source src="${vid}"></video>`;}
    const emb=toEmbed(vid); if(emb){ return `<iframe src="${emb}" title="Etkinlik videosu" style="width:100%;height:100%;border:0;border-radius:12px;display:block" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`; } }
  if(img){ return `<img src="${img}" alt="${ev.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:12px;display:block">`; }
  return `<div style="width:100%;height:100%;display:grid;place-items:center;color:#667085">Medya yok</div>`;
}
document.addEventListener('DOMContentLoaded', async ()=>{
  const listEl = $('#event-list'); if(!listEl) return;
  try{
    const r = await fetch(`${API}/events?t=${Date.now()}`, {headers:{'Accept':'application/json'},cache:'no-store',mode:'cors'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const events = await r.json();
    if(!Array.isArray(events) || !events.length){ listEl.innerHTML=`<p class="muted">Henüz etkinlik yok.</p>`; return; }
    listEl.innerHTML = events.map(ev=>`
      <article class="event-card">
        <div class="event-media">${mediaHTML(ev)}</div>
        <div class="event-meta">
          <span class="event-title">${ev.title}</span>
          <span class="tiny muted">${ev.created_at?new Date(ev.created_at).toLocaleDateString():''}</span>
        </div>
        <p class="event-desc">${ev.description||''}</p>
      </article>`).join('');
  }catch(e){ console.error('[events]',e); listEl.innerHTML=`<p class="muted">Etkinlikler yüklenemedi.</p>`; }
});

/* ADMIN (admin.html) */
document.addEventListener('DOMContentLoaded', ()=>{
  const PIN=window.ADMIN_PIN||'29391354';
  const loginBox=$('#a-login'), panelBox=$('#a-panel');
  const pinIn=$('#a-pin'), enterBtn=$('#a-enter');
  const tabEvents=$('#tab-events'), tabResults=$('#tab-results');
  const eventsPanel=$('#events-panel'), resultsPanel=$('#results-panel');
  const titleIn=$('#event-title'), descIn=$('#event-desc'), imgIn=$('#event-img'), videoIn=$('#event-video');
  const addBtn=$('#add-event'); const eventList=$('#admin-event-list'), resultList=$('#admin-result-list');

  const j=(u,opt={})=>fetch(u,opt).then(r=>{if(!r.ok) throw new Error('HTTP '+r.status); return r.json().catch(()=>({}));});
  const norm=a=>Array.isArray(a)?a:(a&&Array.isArray(a.rows)?a.rows:[]);

  enterBtn?.addEventListener('click',()=>{
    if((pinIn?.value||'').trim()!==PIN) return alert('Hatalı PIN');
    loginBox.style.display='none'; panelBox.style.display='block'; showEvents();
  });

  tabEvents?.addEventListener('click',()=>{eventsPanel.style.display='block'; resultsPanel.style.display='none'; showEvents();});
  tabResults?.addEventListener('click',()=>{resultsPanel.style.display='block'; eventsPanel.style.display='none'; showResults();});

  addBtn?.addEventListener('click',async ()=>{
    try{
      const title=(titleIn?.value||'').trim(), desc=(descIn?.value||'').trim(), img=(imgIn?.value||'').trim(), video=(videoIn?.value||'').trim();
      if(!title) return alert('Başlık gerekli.');
      await j(`${API}/addEvent`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,desc,img,video})});
      titleIn.value=''; descIn.value=''; imgIn.value=''; if(videoIn) videoIn.value='';
      showEvents();
    }catch(e){ alert('Eklenemedi'); }
  });

  async function showEvents(){
    if(!eventList) return; eventList.innerHTML='<p class="muted">Yükleniyor...</p>';
    try{
      const data=await j(`${API}/events?t=${Date.now()}`,{headers:{'Accept':'application/json'},cache:'no-store',mode:'cors'}); const events=norm(data);
      if(!events.length){ eventList.innerHTML='<p class="muted">Henüz etkinlik yok.</p>'; return; }
      eventList.innerHTML = events.map(ev=>`
        <article class="event-card">
          <div class="event-media">${mediaHTML(ev)}</div>
          <div class="event-meta">
            <span class="event-title">${ev.title}</span>
            <span class="tiny muted">${ev.created_at?new Date(ev.created_at).toLocaleDateString():''}</span>
          </div>
          <p class="event-desc">${ev.description||''}</p>
          <div class="event-actions"><button class="btn ghost" data-del="${ev.id}">Sil</button></div>
        </article>`).join('');
      eventList.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',async ()=>{
        if(!confirm('Silinsin mi?')) return;
        await j(`${API}/deleteEvent`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:b.dataset.del})});
        showEvents();
      }));
    }catch(e){ eventList.innerHTML='<p class="muted">Etkinlikler yüklenemedi.</p>'; }
  }

  async function showResults(){
    if(!resultList) return; resultList.innerHTML='<p class="muted">Yükleniyor...</p>';
    try{
      const data=await j(`${API}/results?t=${Date.now()}`,{headers:{'Accept':'application/json'},cache:'no-store',mode:'cors'}); const rows=norm(data);
      if(!rows.length){ resultList.innerHTML='<p class="muted">Kayıt yok.</p>'; return; }
      resultList.innerHTML = rows.map(r=>`
        <div class="history-item">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${new Date(r.created_at||r.at).toLocaleString()}</strong>
            <span class="pill">Genel: ${r.total_pct}%</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${(r.cats||[]).map(c=>`<span class="pill">${c.cat}: ${c.pct}%</span>`).join('')}
          </div>
          <button class="btn ghost" data-id="${r.id}">Sil</button>
        </div>`).join('');
      resultList.querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',async ()=>{
        if(!confirm('Silinsin mi?')) return;
        await j(`${API}/deleteResult`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:b.dataset.id})});
        showResults();
      }));
    }catch(e){ resultList.innerHTML='<p class="muted">Sonuçlar yüklenemedi.</p>'; }
  }
});
