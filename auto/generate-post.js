'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

(async function () {
  const client = new Anthropic();

  const queue         = JSON.parse(fs.readFileSync('auto/keywords-queue.json', 'utf8'));
  const done          = JSON.parse(fs.readFileSync('auto/keywords-done.json',  'utf8'));
  const promptMaestro = fs.readFileSync('auto/prompt-maestro.md', 'utf8');
  const plantilla     = fs.readFileSync('blog/_plantilla.html',   'utf8');

  const pending = queue.filter(k => !done.find(d => d.id === k.id));
  if (pending.length === 0) {
    console.log('No hay keywords pendientes.');
    process.exit(0);
  }

  const kw  = pending[0];
  const hoy = new Date().toISOString().split('T')[0];
  console.log(`Generando: ${kw.keyword}`);

  const tieneAsins = Array.isArray(kw.asins) && kw.asins.length > 0;

  const plantillaBase = tieneAsins
    ? plantilla.replace('</head>', '<script src="/js/amazon-box.js" defer></script>\n</head>')
    : plantilla;

  const asinBlock = tieneAsins
    ? kw.asins.map((a, i) =>
        `Producto ${i + 1}:\n  ASIN: ${a.asin}\n  Título: ${a.titulo}\n  Imagen: ${a.imagen}\n  Precio: ${a.precio}\n  Descripción: ${a.descripcion}`
      ).join('\n\n')
    : 'ninguno';

  const mensaje = `KEYWORD: ${kw.keyword}
TIPO: ${kw.tipo}
KEYWORDS_SECUNDARIAS: ${kw.keywords_secundarias.join(', ')}
LONG_TAIL: ${kw.long_tail.join(', ')}
ASINS:
${asinBlock}
NOTAS: ${kw.notas}
FECHA: ${hoy}

---

TAREA: Rellena la plantilla HTML que aparece abajo con el artículo completo.

REGLAS ESTRICTAS DE OUTPUT:
1. Responde ÚNICAMENTE con el HTML completo. Sin texto antes, sin texto después, sin bloques markdown, sin análisis previo, sin pasos Skyscraper — solo el HTML.
2. Cambia robots a "index, follow"
3. Usa ${hoy} como datePublished en el schema JSON-LD
4. Para posts con ASINs: usa los datos exactos proporcionados. La caja amazon-box solo lleva badge + título + botón (sin descripción ni precio dentro).
5. El slug va en todas las URLs: canonical, og:url, schema url
6. El post-header-img se deja como div vacío si no hay imagen disponible
7. Sigue todas las instrucciones del prompt maestro: voz, estilo, SEO, estructura, interlinking

PLANTILLA:
${plantillaBase}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: promptMaestro,
    messages: [{ role: 'user', content: mensaje }]
  });

  let html = response.content[0].text.trim();
  html = html.replace(/^```html?\s*/i, '').replace(/\s*```$/, '').trim();

  // Extraer slug del canonical
  const mSlug = html.match(/rel="canonical"\s+href="https:\/\/ramperis\.com\/blog\/([^"]+)"/);
  const slug = mSlug
    ? mSlug[1]
    : kw.keyword.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Guardar post como archivo suelto
  fs.writeFileSync(`blog/${slug}.html`, html, 'utf8');
  console.log(`Guardado: blog/${slug}.html`);

  // --- Extraer campos para la tarjeta del blog index ---
  const mTitle    = html.match(/<h1[^>]*class="post-title"[^>]*>([\s\S]*?)<\/h1>/);
  const mCat      = html.match(/<span[^>]*class="post-cat"[^>]*>([\s\S]*?)<\/span>/);
  const mTime     = html.match(/<span[^>]*class="post-time"[^>]*>([\s\S]*?)<\/span>/);
  const mExcerpt  = html.match(/<p[^>]*class="post-excerpt"[^>]*>([\s\S]*?)<\/p>/);
  const mImg      = html.match(/<div[^>]*class="post-header-img"[^>]*>\s*<img[^>]*src="([^"]+)"/);

  const title   = mTitle   ? mTitle[1].replace(/<[^>]+>/g, '').trim() : kw.keyword;
  const cat     = mCat     ? mCat[1].replace(/<[^>]+>/g, '').trim()   : 'Blog';
  const time    = mTime    ? mTime[1].replace(/<[^>]+>/g, '').trim()  : '8 min de lectura';
  const excerpt = mExcerpt ? mExcerpt[1].replace(/<[^>]+>/g, '').trim() : '';
  const imgSrc  = mImg     ? mImg[1] : null;

  const catLower = cat.toLowerCase().replace(/\s+/g, '-');

  const cardImg = imgSrc
    ? `<div class="card-img"><img src="${imgSrc}" alt="${title}" style="width:100%;height:100%;object-fit:cover;"></div>`
    : `<div class="card-img"><div class="card-img-placeholder">🎵</div></div>`;

  const card = `
      <a href="/blog/${slug}" class="blog-card" data-cat="${catLower}" data-date="${hoy}">
        ${cardImg}
        <div class="card-meta">
          <span class="card-cat">${cat}</span>
          <span class="card-dot"></span>
          <span class="card-time">${time}</span>
        </div>
        <h2 class="card-title">${title}</h2>
        <p class="card-excerpt">${excerpt}</p>
      </a>
`;

  // Insertar tarjeta justo después de <!-- BLOG_CARDS_START -->
  const indexPath = 'blog/index.html';
  let indexHtml   = fs.readFileSync(indexPath, 'utf8');
  indexHtml = indexHtml.replace('<!-- BLOG_CARDS_START -->', `<!-- BLOG_CARDS_START -->${card}`);
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log(`Tarjeta añadida en blog/index.html`);

  // Actualizar done y queue
  done.push({ id: kw.id, keyword: kw.keyword, slug, published_at: hoy });
  fs.writeFileSync('auto/keywords-done.json', JSON.stringify(done, null, 2), 'utf8');
  fs.writeFileSync('auto/keywords-queue.json', JSON.stringify(queue.filter(k => k.id !== kw.id), null, 2), 'utf8');

  console.log(`✅ https://ramperis.com/blog/${slug}`);
})();
