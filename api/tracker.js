const REPO   = 'ramperis/web';
const GH_URL = (file) => `https://api.github.com/repos/${REPO}/contents/${file}`;

module.exports = async (req, res) => {
  const { GESTION_TOKEN, GESTION_PASS: TRACKER_PASS } = process.env;

  res.setHeader('Access-Control-Allow-Origin',  req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth: Bearer token = TRACKER_PASS
  const authHeader = req.headers['authorization'] || '';
  if (!TRACKER_PASS || authHeader !== `Bearer ${TRACKER_PASS}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // user param: 'ram' or 'alba'
  const user = (req.query.user || '').replace(/[^a-z]/g, '');
  if (!user) return res.status(400).json({ error: 'Missing user' });

  const FILE   = `data/tracker-${user}.json`;
  const url    = GH_URL(FILE);
  const ghHeaders = {
    Authorization:          `Bearer ${GESTION_TOKEN}`,
    Accept:                 'application/vnd.github+json',
    'User-Agent':           'tracker-app',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  try {
    // ── GET: leer todos los días ─────────────────────────────────────────────
    if (req.method === 'GET') {
      const r = await fetch(url, { headers: ghHeaders });
      if (r.status === 404) return res.json({ days: {}, sha: null });
      if (!r.ok) throw new Error(`GitHub ${r.status}`);
      const file = await r.json();
      const data = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
      return res.json({ ...data, sha: file.sha });
    }

    // ── POST: guardar/mergear días ───────────────────────────────────────────
    if (req.method === 'POST') {
      const { sha, days } = req.body;
      if (!days || typeof days !== 'object') return res.status(400).json({ error: 'Missing days' });

      // Siempre leer el estado actual de cloud antes de mergear
      let currentDays = {};
      let currentSha  = null;
      const r0 = await fetch(url, { headers: ghHeaders });
      if (r0.ok) {
        const file = await r0.json();
        const existing = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
        currentDays = existing.days || {};
        currentSha  = file.sha;
      }

      // Mergear: para cada día, gana el que tenga más tareas (union de ambos)
      const merged = { ...currentDays };
      for (const [date, dayData] of Object.entries(days)) {
        const incoming = Array.isArray(dayData?.done) ? dayData.done : [];
        const existing = Array.isArray(merged[date]?.done) ? merged[date].done : [];
        // Union: quedarse con todas las tareas que aparezcan en cualquiera de los dos
        const union = [...new Set([...existing, ...incoming])];
        merged[date] = { done: union };
      }

      const encoded = Buffer.from(
        JSON.stringify({ days: merged }, null, 2), 'utf8'
      ).toString('base64');

      const payload = {
        message: `tracker ${user}: datos actualizados`,
        content: encoded,
        ...(currentSha ? { sha: currentSha } : {}),
      };

      const r = await fetch(url, {
        method: 'PUT',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(`GitHub ${r.status}: ${err.message || ''}`);
      }

      const result = await r.json();
      return res.json({ sha: result.content.sha, days: merged });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (e) {
    console.error('[tracker api]', e.message);
    return res.status(500).json({ error: e.message });
  }
};
