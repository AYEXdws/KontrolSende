document.addEventListener('DOMContentLoaded', () => {
  // --- Mobil menü ---
  const hamburger = document.getElementById('hamburger-menu');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // --- Test mantığı ---
  const quizContainer = document.getElementById('quiz-container');
  if (!quizContainer) return;

  // Kategoriler ve sorular (uyuşturucu YOK; sigara + alkol + genel alanlar)
  // Skor: 0 (düşük risk) → 3 (yüksek eğilim)
  const questions = [
    // SIGARA (4)
    { cat: 'Sigara', question: 'Sigara içme düşüncesi gün içinde ne sıklıkla aklına geliyor?', answers: [
      { text: 'Hiç gelmiyor.', score: 0 },
      { text: 'Ara sıra aklıma gelir.', score: 1 },
      { text: 'Sık aklıma geliyor.', score: 2 },
      { text: 'Çoğu zaman aklımdan çıkmıyor.', score: 3 }
    ]},
    { cat: 'Sigara', question: 'Sigara içilen ortamlarda bulunmak seni nasıl etkiler?', answers: [
      { text: 'Etkilenmem, nötrüm.', score: 0 },
      { text: 'Biraz etkilenirim.', score: 1 },
      { text: 'Canım çekebilir.', score: 2 },
      { text: 'Dayanmakta zorlanırım.', score: 3 }
    ]},
    { cat: 'Sigara', question: 'Daha önce bırakmayı denedin mi?', answers: [
      { text: 'İhtiyaç duymadım/İçmiyorum.', score: 0 },
      { text: 'Denemedim ama düşünüyorum.', score: 1 },
      { text: 'Denedim, kısa süreli bırakabildim.', score: 2 },
      { text: 'Birçok kez denedim ama sürdüremedim.', score: 3 }
    ]},
    { cat: 'Sigara', question: 'Okul/ev gibi yerlerde “yasak” olduğunda ne hissedersin?', answers: [
      { text: 'Normal, problem yaşamam.', score: 0 },
      { text: 'Biraz huzursuz olurum.', score: 1 },
      { text: 'Gergin/huzursuz olurum.', score: 2 },
      { text: 'Yoğun istek ve sinirlilik yaşarım.', score: 3 }
    ]},

    // ALKOL (4)
    { cat: 'Alkol', question: 'Alkol tüketme sıklığın nasıldır?', answers: [
      { text: 'Hiç/çok nadir.', score: 0 },
      { text: 'Sosyal ortamlarda ara sıra.', score: 1 },
      { text: 'Düzenli (haftalık vb.).', score: 2 },
      { text: 'Sık ve kontrol zorlayıcı.', score: 3 }
    ]},
    { cat: 'Alkol', question: 'Moralin bozukken alkolü çözüm gibi görür müsün?', answers: [
      { text: 'Hayır, başka yollar denerim.', score: 0 },
      { text: 'Bazen aklımdan geçer.', score: 1 },
      { text: 'Çoğu zaman öyle olur.', score: 2 },
      { text: 'Genelde ilk seçeneğimdir.', score: 3 }
    ]},
    { cat: 'Alkol', question: 'Alkol sonrası ertesi gün planlarını/sorumluluklarını etkiler mi?', answers: [
      { text: 'Hayır.', score: 0 },
      { text: 'Nadiren ufak etkiler.', score: 1 },
      { text: 'Bazen ciddi etkiler.', score: 2 },
      { text: 'Sıklıkla olumsuz etkiler.', score: 3 }
    ]},
    { cat: 'Alkol', question: 'Kaç kadehle duracağını kontrol etmek zorlaşır mı?', answers: [
      { text: 'Hayır, rahatça dururum.', score: 0 },
      { text: 'Bazen.', score: 1 },
      { text: 'Sık zorlanırım.', score: 2 },
      { text: 'Genelde kontrol edemem.', score: 3 }
    ]},

    // DİJİTAL (4)
    { cat: 'Dijital', question: 'Telefon/sosyal medya/oyun yüzünden uykunu ertelediğin olur mu?', answers: [
      { text: 'Hayır.', score: 0 },
      { text: 'Nadiren.', score: 1 },
      { text: 'Bazen sık.', score: 2 },
      { text: 'Çoğu zaman/alışkanlık oldu.', score: 3 }
    ]},
    { cat: 'Dijital', question: 'Gerçek planları dijital aktivite için iptal ettiğin olur mu?', answers: [
      { text: 'Asla.', score: 0 },
      { text: 'Nadiren.', score: 1 },
      { text: 'Bazen.', score: 2 },
      { text: 'Sıklıkla.', score: 3 }
    ]},
    { cat: 'Dijital', question: 'Ekran başında geçen süreyi azaltmakta zorlanır mısın?', answers: [
      { text: 'Kolay azaltırım.', score: 0 },
      { text: 'Biraz zorlanırım.', score: 1 },
      { text: 'Zorlanırım.', score: 2 },
      { text: 'Çok zorlanırım.', score: 3 }
    ]},
    { cat: 'Dijital', question: 'Bildirim gelmediğinde bile sık kontrol eder misin?', answers: [
      { text: 'Hayır.', score: 0 },
      { text: 'Ara sıra.', score: 1 },
      { text: 'Sık sık.', score: 2 },
      { text: 'Sürekli kontrol ederim.', score: 3 }
    ]},

    // ALIŞVERİŞ/KUMAR (2)
    { cat: 'Alışveriş/Kumar', question: 'Planladığından fazla para harcadığın olur mu (alışveriş/oyun içi harcama vb.)?', answers: [
      { text: 'Hayır.', score: 0 },
      { text: 'Nadiren.', score: 1 },
      { text: 'Bazen.', score: 2 },
      { text: 'Sıklıkla.', score: 3 }
    ]},
    { cat: 'Alışveriş/Kumar', question: 'Harcamadan sonra pişmanlık ve telafi etme düşüncesi (kayıp kovalamak) yaşar mısın?', answers: [
      { text: 'Hayır.', score: 0 },
      { text: 'Ara sıra.', score: 1 },
      { text: 'Sık.', score: 2 },
      { text: 'Çoğu zaman.', score: 3 }
    ]},

    // GENEL ÖZ-DÜZENLEME (2)
    { cat: 'Genel', question: '“Kontrol bende” duygunu ne kadar güçlü hissediyorsun?', answers: [
      { text: 'Güçlü hissediyorum.', score: 0 },
      { text: 'Genelde iyi.', score: 1 },
      { text: 'Sık dalgalanıyor.', score: 2 },
      { text: 'Çoğu zaman zayıf.', score: 3 }
    ]},
    { cat: 'Genel', question: 'Duygusal zorlanmalarda sağlıklı başa çıkma yollarını kullanma sıklığın nedir?', answers: [
      { text: 'Sıklıkla kullanırım.', score: 0 },
      { text: 'Ara sıra.', score: 1 },
      { text: 'Nadiren.', score: 2 },
      { text: 'Kullanmakta zorlanırım.', score: 3 }
    ]},
  ];

  // Durumlar
  let current = 0;
  const answersPicked = Array(questions.length).fill(null);

  // Elemanlar
  const progressBar = document.getElementById('progress-bar');
  const questionContainer = document.getElementById('question-container');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const restartBtn = document.getElementById('restart-btn');
  const resultContainer = document.getElementById('result-container');
  const questionCounter = document.getElementById('question-counter');
  const categoryChip = document.getElementById('category-chip');
  const percentChip = document.getElementById('percent-chip');
  const historyContainer = document.getElementById('history-container');
  const historyList = document.getElementById('history-list');

  function updateProgress() {
    const answered = answersPicked.filter(v => v !== null).length;
    const pct = Math.round((answered / questions.length) * 100);
    progressBar.style.width = `${pct}%`;
    percentChip.textContent = `%${pct}`;
  }

  function renderQuestion() {
    const q = questions[current];
    questionCounter.textContent = `Soru ${current + 1} / ${questions.length}`;
    categoryChip.textContent = q.cat;

    // Soru + seçenekler
    questionContainer.innerHTML = `
      <p>${q.question}</p>
      <div class="options" role="listbox" aria-label="Seçenekler">
        ${q.answers.map((a, i) => `
          <button class="option${answersPicked[current] === i ? ' selected':''}" role="option"
                  data-index="${i}" data-score="${a.score}" tabindex="0">
            ${a.text}
          </button>
        `).join('')}
      </div>
    `;

    // Seçim olayları
    questionContainer.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.dataset.index);
        answersPicked[current] = idx;
        // görsel seçim
        questionContainer.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        updateProgress();
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      });
    });

    // Navigasyon buton durumları
    prevBtn.disabled = current === 0;
    nextBtn.textContent = (current === questions.length - 1) ? 'Bitir' : 'Sonraki';
  }

  function computeStats() {
    const catTotals = {};
    const catMax = {};
    questions.forEach((q, i) => {
      const ansIdx = answersPicked[i];
      if (ansIdx === null) return;
      const s = q.answers[ansIdx].score;
      catTotals[q.cat] = (catTotals[q.cat] || 0) + s;
      catMax[q.cat] = (catMax[q.cat] || 0) + 3;
    });

    // Toplam skor
    const totalScore = Object.values(catTotals).reduce((a,b) => a + b, 0);
    const maxScore = questions.length * 3;
    const totalPct = Math.round((totalScore / maxScore) * 100);

    // Kategori yüzdeleri
    const cats = Object.keys(catMax).map(cat => {
      const pct = Math.round(((catTotals[cat] || 0) / catMax[cat]) * 100);
      return { cat, pct, raw: catTotals[cat] || 0, max: catMax[cat] };
    });

    return { totalScore, maxScore, totalPct, cats };
  }

  function levelText(pct) {
    if (pct <= 33) return { label: 'Düşük eğilim', tone: 'good' };
    if (pct <= 66) return { label: 'Orta eğilim', tone: 'mid' };
    return { label: 'Yüksek eğilim', tone: 'high' };
  }

  function adviceFor(cat, pct) {
    // Kısa, okul-uyumlu öneriler
    const base = {
      good: 'Denge iyi görünüyor. Bu çizgiyi koruyabilirsin.',
      mid: 'Bazen zorlayıcı olabilir. Küçük planlar ve sınırlar işe yarar.',
      high: 'Güvenilir bir yetişkin/rehber öğretmenle görüşmek iyi gelebilir.'
    };
    const tone = levelText(pct).tone;

    const catLines = {
      'Sigara': {
        good: 'Davetkâr ortamlarda da “hayır” demeyi sürdür.',
        mid:  'Tetikleyici ortamlarda durmayı ve temiz hava/mini yürüyüş gibi alternatifleri dene.',
        high: 'Bırakma planı için (nikotin yerine) davranışsal destek konuşulabilir.'
      },
      'Alkol': {
        good: 'Sosyal ortamlarda sınırlarını koruman çok değerli.',
        mid:  '“Önceden belirlenmiş kural” (örn. max 1 kadeh) ve eşlikçi içecek kullan.',
        high: 'Duygu düzenleme becerilerini pekiştirmek için profesyonel destek yararlı olur.'
      },
      'Dijital': {
        good: 'Ekran/vakit dengesi yerinde.',
        mid:  'Bildirim sessizleri, yatmadan 1 saat ekran bırakma işe yarar.',
        high: 'Günlük ekran süresi hedefi ve aile/öğretmen desteğiyle plan çiz.'
      },
      'Alışveriş/Kumar': {
        good: 'Bütçe planı ve takip iyi gidiyor.',
        mid:  'Listeyle alışveriş ve “24 saat bekleme kuralı” dene.',
        high: 'Harcamaları kısıtlayacak çevresel önlemler ve güvenilir bir rehberle plan kur.'
      },
      'Genel': {
        good: 'Sağlıklı başa çıkma becerilerin çalışıyor.',
        mid:  'Nefes, kısa yürüyüş, yazma gibi araçları düzenli dene.',
        high: 'Rehberlik servisiyle küçük, uygulanabilir hedefler koymak iyi gelir.'
      }
    };

    const line = (catLines[cat] && catLines[cat][tone]) || base[tone];
    return `${levelText(pct).label}. ${line}`;
  }

  function renderBars(cats) {
    return `
      <div class="bars">
        ${cats.map(c => `
          <div class="bar">
            <div class="bar-top">
              <strong>${c.cat}</strong>
              <span class="bar-val">${c.pct}%</span>
            </div>
            <div class="bar-bg" aria-hidden="true">
              <div class="bar-fill ${levelText(c.pct).tone}" style="width:${c.pct}%"></div>
            </div>
            <p class="bar-note">${adviceFor(c.cat, c.pct)}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  function showResults() {
    const stats = computeStats();
    const lvl = levelText(stats.totalPct);
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';

    resultContainer.innerHTML = `
      <h2>Genel Görünüm: ${lvl.label} (${stats.totalPct}%)</h2>
      <p>Bu sonuç bir teşhis değildir; yalnızca farkındalık sağlar. Dengeyi güçlendirmek için küçük adımlar atabilirsin.
      Daha fazla destek için <a href="yardim.html">Yardım Al</a> sayfamızı ziyaret et.</p>

      ${renderBars(stats.cats)}

      <div class="result-actions">
        <button id="save-result" class="">Sonucumu Kaydet</button>
        <a class="ghost" href="yardim.html">Yardım ve Destek Noktaları</a>
        <button id="restart-from-result" class="ghost">Testi Yeniden Başlat</button>
      </div>
    `;

    document.getElementById('restart-from-result')?.addEventListener('click', restart);
    document.getElementById('save-result')?.addEventListener('click', () => {
      const payload = {
        at: new Date().toISOString(),
        totalPct: stats.totalPct,
        cats: stats.cats
      };
      const key = 'ks-results';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift(payload);
      localStorage.setItem(key, JSON.stringify(list));
      loadHistory();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }

  function loadHistory() {
    const list = JSON.parse(localStorage.getItem('ks-results') || '[]');
    if (list.length === 0) {
      historyContainer.style.display = 'none';
      return;
    }
    historyContainer.style.display = 'block';
    historyList.innerHTML = list.slice(0, 5).map(item => `
      <div class="history-item">
        <div class="history-head">
          <strong>${new Date(item.at).toLocaleString()}</strong>
          <span class="pill">Genel: ${item.totalPct}%</span>
        </div>
        <div class="history-cats">
          ${item.cats.map(c => `<span class="pill soft">${c.cat}: ${c.pct}%</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  function next() {
    // Seçim yoksa uyarı
    if (answersPicked[current] === null) {
      alert('Lütfen bir seçenek belirleyin.');
      return;
    }
    if (current < questions.length - 1) {
      current++;
      renderQuestion();
    } else {
      showResults();
    }
  }

  function prev() {
    if (current > 0) {
      current--;
      renderQuestion();
    }
  }

  function restart() {
    for (let i = 0; i < answersPicked.length; i++) answersPicked[i] = null;
    current = 0;
    quizContainer.style.display = 'block';
    resultContainer.style.display = 'none';
    restartBtn.style.display = 'none';
    updateProgress();
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Event bağlama
  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);
  restartBtn?.addEventListener('click', restart);

  // Başlangıç
  loadHistory();
  updateProgress();
  renderQuestion();
});
