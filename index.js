import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Veritabanı bağlantısı
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_02AEncOKgSkx@ep-green-breeze-ad24w9mh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false },
});

// 🔹 Tablo oluştur (ilk seferde)
pool.query(`
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  total_pct INT NOT NULL,
  cats JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
`);

// 🔹 Test sonucu ekleme
app.post("/addResult", async (req, res) => {
  const { total_pct, cats } = req.body;
  try {
    await pool.query("INSERT INTO results (total_pct, cats) VALUES ($1, $2)", [
      total_pct,
      JSON.stringify(cats),
    ]);
    res.json({ message: "Kayıt eklendi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Veri kaydedilemedi" });
  }
});

// 🔹 Test sonuçlarını listeleme
app.get("/getResults", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM results ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Veri çekilemedi" });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`✅ API port ${port} üzerinde çalışıyor`));
