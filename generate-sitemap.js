'use strict';
const fs   = require('fs');
const path = require('path');

const BASE_URL = 'https://ramperis.com';
const ROOT     = __dirname;

const EXCLUDE = new Set([
  '404.html',
  'aviso-legal.html',
  'politica-privacidad.html',
  'politica-cookies.html',
  'blog/_plantilla.html',
  'blog/plantilla-post/index.html',
]);

function findHtmlFiles(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findHtmlFiles(full, result);
    } else if (entry.name.endsWith('.html')) {
      result.push(full);
    }
  }
  return result;
}

function toUrlPath(filePath) {
  let rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  rel = rel.replace(/\.html$/, '');
  if (rel === 'index') return '/';
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length);
  return '/' + rel;
}

function getPriority(urlPath) {
  if (urlPath === '/') return '1.0';
  if (urlPath.startsWith('/blog/') && urlPath !== '/blog') return '0.7';
  return '0.9';
}

const urls = findHtmlFiles(ROOT)
  .map(f => ({ rel: path.relative(ROOT, f).replace(/\\/g, '/'), full: f }))
  .filter(({ rel }) => !EXCLUDE.has(rel))
  .map(({ full }) => {
    const urlPath = toUrlPath(full);
    return { urlPath, priority: getPriority(urlPath) };
  })
  .sort((a, b) => {
    if (a.urlPath === '/') return -1;
    if (b.urlPath === '/') return 1;
    const pd = parseFloat(b.priority) - parseFloat(a.priority);
    return pd !== 0 ? pd : a.urlPath.localeCompare(b.urlPath);
  });

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';

for (const { urlPath, priority } of urls) {
  xml += '  <url>\n';
  xml += `    <loc>${BASE_URL}${urlPath}</loc>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += `    <priority>${priority}</priority>\n`;
  xml += '  </url>\n\n';
}

xml += '</urlset>\n';

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml generado — ${urls.length} URLs`);
