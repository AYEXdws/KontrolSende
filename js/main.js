/* =========================================================
   KontrolSende • main.js (Tam sürüm)
   ========================================================= */

const $  = (s,sc=document)=>sc.querySelector(s);
const $$ = (s,sc=document)=>sc.querySelectorAll(s);
const uid=()=> 'id_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
const nowISO=()=>new Date().toISOString();
const safeJSON=(s,f)=>{try{return JSON.parse(s)}catch{return f}};

/* -------------------------------
   Basit localStorage veritabanı
--------------------------------*/
const DB = (()=> {
  const K = {events:'ks_events', results:'ks_results'};
  function ensureSeed(){
    const ev = safeJSON(localStorage.getItem(K.events),[]);
    if(!ev.length){
      const seed=[
        {id:uid(),title:'Farkındalık Semineri',desc:'Sigara ve alkolün beyindeki etkileri.',img:'https://images.unsplash.com/photo-1606761568499-6d2451b23c67?q=80&w=1200&auto=format&fit=crop',at:nowISO()},
        {id:uid(),title:'Dijital Detoks Atölyesi',desc:'Bildirim yönetimi, ekran süresi ipuçları.',img:'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',at:nowISO()},
        {id:uid(),title:'Sporda Denge',desc:'Sağlıklı alışkanlıklar ve özdenetim.',img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',at:nowISO()}
      ];
      localStorage.setItem(K.events,JSON.stringify(seed));
    }
    if(!localStorage.getItem(K.results))localStorage.setItem(K.results,JSON.stringify([]));
  }
  async function getEvents(){ensureSeed();return safeJSON(localStorage.getItem(K.events),[]);}
  async function addResult(r){const l=safeJSON(localStorage.getItem(K.results),[]);l.unshift(r);localStorage.setItem(K.results,JSON.stringify(l));return true;}
  async function getResults(){return safeJSON(localStorage.getItem(K.results),[]);}
  return {getEvents,addResult,getResults};
})();

/* -------------------------------
   Navbar (mobil menü)
--------------------------------*/
document.addEventListener('DOMContentLoaded',()=>{
  const h=$('#ks-header'),b=$('#ks-hamburger'),d=$('#ks-drawer');
  if(!h||!b||!d)return;
  let backdrop=document.querySelector('.ks-backdrop');
  if(!backdrop){backdrop=document.createElement('div');backdrop.className='ks-backdrop';document.body.appendChild(backdrop);}
  const open=()=>{d.classList.add('ks-open');b.classList.add('ks-active');backdrop.classList.add('ks-show');document.documentElement.style.overflow='hidden';};
  const close=()=>{d.classList.remove('ks-open');b.classList.remove('ks-active');backdrop.classList.remove('ks-show');document.documentElement.style.overflow='';};
  b.onclick=()=>d.classList.contains('ks-open')?close():open();
  backdrop.onclick=close;
});

/* -------------------------------
   TEST SAYFASI (Tüm sorular geri yüklendi)
--------------------------------*/
document.addEventListener('DOMContentLoaded',()=>{
  const quiz=$('#quiz-container'); if(!quiz)return;

  const questions=[
    // --- Sigara ---
    {cat:'Sigara',q:'Sigara içme düşüncesi gün içinde ne sıklıkla aklına geliyor?',a:[['Hiç gelmiyor.',0],['Ara sıra aklıma gelir.',1],['Sık aklıma geliyor.',2],['Çoğu zaman aklımdan çıkmıyor.',3]]},
    {cat:'Sigara',q:'Sigara içilen ortamlarda bulunmak seni nasıl etkiler?',a:[['Etkilenmem.',0],['Biraz etkilenirim.',1],['Canım çekebilir.',2],['Dayanmakta zorlanırım.',3]]},
    {cat:'Sigara',q:'Daha önce bırakmayı denedin mi?',a:[['İhtiyaç duymadım.',0],['Denemedim ama düşünüyorum.',1],['Kısa süreli bırakabildim.',2],['Birçok kez denedim.',3]]},
    {cat:'Sigara',q:'Yasak ortamlarda ne hissedersin?',a:[['Normal.',0],['Biraz huzursuz.',1],['Gergin olurum.',2],['Yoğun istek.',3]]},
    // --- Alkol ---
    {cat:'Alkol',q:'Alkol tüketme sıklığın nasıldır?',a:[['Hiç/çok nadir.',0],['Ara sıra.',1],['Düzenli.',2],['Sık ve kontrol zor.',3]]},
    {cat:'Alkol',q:'Moralin bozukken alkolü çözüm gibi görür müsün?',a:[['Hayır.',0],['Bazen aklımdan geçer.',1],['Çoğu zaman öyle olur.',2],['Genelde ilk seçeneğimdir.',3]]},
    {cat:'Alkol',q:'Alkol sonrası sorumlulukların etkilenir mi?',a:[['Hayır.',0],['Nadiren.',1],['Bazen ciddi etkiler.',2],['Sıklıkla olumsuz etkiler.',3]]},
    {cat:'Alkol',q:'Kaç kadehle duracağını kontrol etmek zorlaşır mı?',a:[['Hayır.',0],['Bazen.',1],['Sık zorlanırım.',2],['Genelde kontrol edemem.',3]]},
    // --- Dijital ---
    {cat:'Dijital',q:'Telefon/sosyal medya yüzünden uykunu ertelediğin olur mu?',a:[['Hayır.',0],['Nadiren.',1],['Bazen.',2],['Sık sık.',3]]},
    {cat:'Dijital',q:'Gerçek planları dijital aktivite için iptal ettiğin olur mu?',a:[['Asla.',0],['Nadiren.',1],['Bazen.',2],['Sıklıkla.',3]]},
    {cat:'Dijital',q:'Ekran süresini azaltmakta zorlanır mısın?',a:[['Kolay azaltırım.',0],['Biraz zorlanırım.',1],['Zorlanırım.',2],['Çok zorlanırım.',3]]},
    {cat:'Dijital',q:'Bildirim gelmese de sık kontrol eder misin?',a:[['Hayır.',0],['Ara sıra.',1],['Sık sık.',2],['Sürekli kontrol ederim.',3]]},
    // --- Alışveriş/Kumar ---
    {cat:'Alışveriş/Kumar',q:'Planladığından fazla para harcar mısın?',a:[['Hayır.',0],['Nadiren.',1],['Bazen.',2],['Sıklıkla.',3]]},
    {cat:'Alışveriş/Kumar',q:'Pişman olup kaybı telafi etmeye çalışır mısın?',a:[['Hayır.',0],['Ara sıra.',1],['Sık.',2],['Çoğu zaman.',3]]},
    // --- Genel ---
    {cat:'Genel',q:'“Kontrol bende” duygun ne kadar güçlü?',a:[['Güçlü hissediyorum.',0],['Genelde iyi.',1],['Dalgalanıyor.',2],['Zayıf.',3]]},
    {cat:'Genel',q:'Zorlanmalarda sağlıklı başa çıkma yollarını kullanma sıklığın?',a:[['Sıklıkla.',0],['Ara sıra.',1],['Nadiren.',2],['Zorlanırım.',3]]}
  ];

  let i=0; const picked=Array(questions.length).fill(null);
  const qWrap=$('#question-container'),nextBtn=$('#next-btn'),prevBtn=$('#prev-btn'),result=$('#result-container');

  function renderQuestion(){
    const q=questions[i];
    qWrap.innerHTML=`
      <h3>${q.cat}</h3>
      <p>${q.q}</p>
      <div class="options">
        ${q.a.map((p,idx)=>`<button class="option ${picked[i]===idx?'selected':''}" data-i="${idx}">${p[0]}</button>`).join('')}
      </div>`;
    qWrap.querySelectorAll('.option').forEach(btn=>{
      btn.onclick=(e)=>{picked[i]=Number(e.target.dataset.i);
        qWrap.querySelectorAll('.option').forEach(b=>b.classList.remove('selected'));
        e.target.classList.add('selected');
      };
    });
    prevBtn.disabled=i===0;
    nextBtn.textContent=i===questions.length-1?'Bitir':'Sonraki';
  }

  function computeStats(){
    const totals={},maxs={};
    questions.forEach((q,idx)=>{
      const p=picked[idx]; if(p===null)return;
      const s=q.a[p][1]; totals[q.cat]=(totals[q.cat]||0)+s; maxs[q.cat]=(maxs[q.cat]||0)+3;
    });
    const totalScore=Object.values(totals).reduce((a,b)=>a+b,0);
    const maxScore=questions.length*3;
    const totalPct=Math.round(totalScore/maxScore*100);
    const cats=Object.keys(maxs).map(cat=>({cat,pct:Math.round((totals[cat]||0)/maxs[cat]*100)}));
    return {totalPct,cats};
  }

  function showResults(){
    const s=computeStats();
    quiz.style.display='none';
    result.style.display='block';
    result.innerHTML=`
      <h2>Genel Sonuç: ${s.totalPct}%</h2>
      <p>Bu test farkındalık amaçlıdır.</p>
      <button id="save-result" class="btn btn-primary">Sonucumu Kaydet</button>`;
    $('#save-result').onclick=async()=>{
      await DB.addResult({at:nowISO(),totalPct:s.totalPct,cats:s.cats});
      alert('Sonucunuz kaydedildi.');
      // NeonDB API'ye gönder
      fetch("https://kontrolsende-1.onrender.com/addResult",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({total_pct:s.totalPct,cats:s.cats})
      }).then(r=>r.json()).then(d=>console.log("✅ NeonDB'ye gönderildi:",d))
      .catch(e=>console.error("❌ API hatası:",e));
    };
  }

  nextBtn.onclick=()=>{if(picked[i]===null){alert('Bir seçenek seç.');return;}
    if(i<questions.length-1)i++;else return showResults();renderQuestion();};
  prevBtn.onclick=()=>{if(i>0)i--;renderQuestion();};
  renderQuestion();
});

/* -------------------------------
   Etkinlikler sayfası
--------------------------------*/
document.addEventListener('DOMContentLoaded',async()=>{
  const el=$('#event-list'); if(!el)return;
  const evs=await DB.getEvents();
  el.innerHTML=evs.map(e=>`<article><img src="${e.img}" alt=""><h3>${e.title}</h3><p>${e.desc}</p></article>`).join('');
});
