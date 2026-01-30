const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required for postgres variant.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false } });

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS test_results (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      payload JSONB NOT NULL
    );
  `);
}

function requireAdmin(req, res, next) {
  const pass = req.header('X-Admin-Password') || '';
  if (pass !== ADMIN_PASSWORD) return res.status(401).json({ error: 'unauthorized' });
  next();
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.post('/api/results', async (req, res) => {
  const report = req.body;
  if (!report || typeof report !== 'object') return res.status(400).json({ error: 'bad_request' });
  report.id = report.id ? String(report.id) : String(Date.now());
  try {
    await pool.query(
      'INSERT INTO test_results (id, payload) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload',
      [report.id, report]
    );
    res.json({ ok: true, id: report.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get('/api/results', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT payload FROM test_results ORDER BY created_at DESC');
    res.json(rows.map(r => r.payload));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.delete('/api/results/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM test_results WHERE id=$1', [String(req.params.id)]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.delete('/api/results', requireAdmin, async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE test_results');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// static
app.use(express.static(path.join(__dirname, 'public')));

initDb()
  .then(() => app.listen(PORT, () => console.log('Server started on', PORT)))
  .catch((e) => { console.error('DB init failed', e); process.exit(1); });
