/* 🧠 KontrolSende - Ana JS Dosyası */

// API adresi (Render)
const API_URL = "https://kontrolsende.onrender.com";

// 🔹 Sayfa aktif bağlantısını işaretle
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll("nav a");
  links.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
});

// 🔹 Test sonucu kaydetme (test.html tarafından çağrılır)
async function saveTestResult(resultData) {
  try {
    const response = await fetch(`${API_URL}/addResult`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultData)
    });
    const data = await response.json();
    console.log("✅ Test sonucu kaydedildi:", data);
  } catch (err) {
    console.error("❌ Kayıt hatası:", err);
  }
}

// 🔹 Admin paneli: sonuçları çek
async function fetchResults() {
  try {
    const response = await fetch(`${API_URL}/getResults`);
    const data = await response.json();
    renderResults(data);
  } catch (err) {
    console.error("❌ Veriler alınamadı:", err);
  }
}

// 🔹 Admin panelinde tablo oluştur
function renderResults(results) {
  const table = document.querySelector("#resultsTable tbody");
  if (!table) return;

  table.innerHTML = "";

  if (!results.length) {
    table.innerHTML = "<tr><td colspan='4'>Henüz kayıtlı sonuç yok.</td></tr>";
    return;
  }

  results.forEach(r => {
    const cats = r.cats ? JSON.parse(r.cats) : [];
    const catsText = cats.map(c => `${c.cat}: ${c.pct}%`).join(" • ");
    const row = `
      <tr>
        <td>${r.id}</td>
        <td>${r.total_pct}%</td>
        <td>${catsText}</td>
        <td>${new Date(r.created_at).toLocaleString("tr-TR")}</td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

// 🔹 Admin paneli PIN kontrolü
function checkAdminAccess() {
  const pin = prompt("Admin girişi için PIN girin:");
  if (pin !== "2468") {
    alert("Hatalı PIN! Erişim reddedildi.");
    window.location.href = "index.html";
  } else {
    fetchResults();
  }
}

// 🔹 Yardımcı: Ortalamayı hesapla
function average(array) {
  return array.reduce((a, b) => a + b, 0) / array.length;
}
