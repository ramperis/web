const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const POSTS_JSON = path.join(ROOT, 'blog', 'posts.json');
const INDEX_HTML = path.join(ROOT, 'blog', 'index.html');

const START_MARKER = '<!-- BLOG_CARDS_START -->';
const END_MARKER = '<!-- BLOG_CARDS_END -->';

function generateCard(post) {
  return `      <a href="/blog/${post.slug}" class="blog-card" data-cat="${post.cat}">
        <div class="card-img">
          <img src="${post.imagen}" alt="${post.alt}" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div class="card-meta">
          <span class="card-cat">${post.categoria}</span>
          <span class="card-dot"></span>
          <span class="card-time">${post.tiempo}</span>
        </div>
        <h2 class="card-title">${post.titulo}</h2>
        <p class="card-excerpt">${post.extracto}</p>
      </a>`;
}

const posts = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8'));
const template = fs.readFileSync(INDEX_HTML, 'utf8');

const startIdx = template.indexOf(START_MARKER);
const endIdx = template.indexOf(END_MARKER);

if (startIdx === -1 || endIdx === -1) {
  throw new Error('Marcadores BLOG_CARDS_START / BLOG_CARDS_END no encontrados en blog/index.html');
}

const before = template.slice(0, startIdx + START_MARKER.length);
const after = template.slice(endIdx);

const cards = '\n' + posts.map(generateCard).join('\n\n') + '\n';

const output = before + cards + after;

fs.writeFileSync(INDEX_HTML, output, 'utf8');
console.log(`blog/index.html generado: ${posts.length} tarjetas`);
