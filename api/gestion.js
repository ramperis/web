const REPO    = 'ramperis/web';
const FILE    = 'data/gestion.json';
const GH_URL  = `https://api.github.com/repos/${REPO}/contents/${FILE}`;

module.exports = async (req, res) => {
  const { GESTION_TOKEN, GESTION_PASS } = process.env;

  res.setHeader('Access-Control-Allow-Origin',  req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth: el frontend manda el mismo PASS como Bearer token
  const authHeader = req.headers['authorization'] || '';
  if (!GESTION_PASS || authHeader !== `Bearer ${GESTION_PASS}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const ghHeaders = {
    Authorization:          `Bearer ${GESTION_TOKEN}`,
    Accept:                 'application/vnd.github+json',
    'User-Agent':           'gestion-app',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  try {
    // ── GET: leer datos ────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const r = await fetch(GH_URL, { headers: ghHeaders });
      if (r.status === 404) return res.json({ sesiones: [], sha: null });
      if (!r.ok) throw new Error(`GitHub ${r.status}`);

      const file = await r.json();
      const data = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
      return res.json({ ...data, sha: file.sha });
    }

    // ── POST: guardar datos ────────────────────────────────────────────────
    if (req.method === 'POST') {
      const { sha, sesiones } = req.body;
      const encoded = Buffer.from(
        JSON.stringify({ sesiones }, null, 2), 'utf8'
      ).toString('base64');

      const payload = {
        message: `gestión: datos actualizados`,
        content: encoded,
        ...(sha ? { sha } : {}),
      };

      const r = await fetch(GH_URL, {
        method: 'PUT',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(`GitHub ${r.status}: ${err.message || ''}`);
      }

      const result = await r.json();
      return res.json({ sha: result.content.sha });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (e) {
    console.error('[gestion api]', e.message);
    return res.status(500).json({ error: e.message });
  }
};
