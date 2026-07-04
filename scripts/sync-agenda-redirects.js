/**
 * sync-agenda-redirects.js
 * Lee eventos.json, detecta eventos pasados cuya carpeta /agenda/ ya no existe
 * y añade automáticamente el 301 en vercel.json antes del deploy.
 */

const fs   = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..');
const EVENTOS     = path.join(ROOT, 'eventos.json');
const VERCEL      = path.join(ROOT, 'vercel.json');
const AGENDA_DIR  = path.join(ROOT, 'agenda');

const MESES = { Ene:0, Feb:1, Mar:2, Abr:3, May:4, Jun:5, Jul:6, Ago:7, Sep:8, Oct:9, Nov:10, Dic:11 };

function eventoDate(e) {
  const hoy = new Date();
  const y   = hoy.getFullYear();
  const m   = MESES[e.mes] ?? 0;
  const d   = parseInt(e.dia, 10);
  const fecha = new Date(y, m, d);
  if (hoy - fecha > 180 * 86400000) return new Date(y + 1, m, d);
  return fecha;
}

const eventos = JSON.parse(fs.readFileSync(EVENTOS, 'utf8'));
const vercel  = JSON.parse(fs.readFileSync(VERCEL,  'utf8'));
const hoy     = new Date(); hoy.setHours(0, 0, 0, 0);

if (!vercel.redirects) vercel.redirects = [];

const existingSources = new Set(vercel.redirects.map(r => r.source));

let added = 0;

for (const e of eventos) {
  if (!e.url || !e.url.startsWith('/agenda/')) continue;

  const fecha = eventoDate(e);
  if (fecha >= hoy) continue; // evento futuro, no tocar

  const slug    = e.url.replace(/^\/agenda\//, '');
  const carpeta = path.join(AGENDA_DIR, slug);
  const existe  = fs.existsSync(carpeta) && fs.existsSync(path.join(carpeta, 'index.html'));

  if (!existe && !existingSources.has(e.url)) {
    vercel.redirects.push({
      source:      e.url,
      destination: '/agenda',
      permanent:   true
    });
    existingSources.add(e.url);
    console.log(`  ✓ Redirect añadido: ${e.url} → /agenda`);
    added++;
  }
}

if (added > 0) {
  fs.writeFileSync(VERCEL, JSON.stringify(vercel, null, 2) + '\n', 'utf8');
  console.log(`sync-agenda-redirects: ${added} redirect(s) añadido(s) a vercel.json`);
} else {
  console.log('sync-agenda-redirects: nada que añadir');
}
