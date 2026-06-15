'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

(async function () {
  const client = new Anthropic();

  const queue        = JSON.parse(fs.readFileSync('auto/keywords-queue.json', 'utf8'));
  const done         = JSON.parse(fs.readFileSync('auto/keywords-done.json',  'utf8'));
  const promptMaestro = fs.readFileSync('auto/prompt-maestro.md', 'utf8');
  const plantilla     = fs.readFileSync('blog/_plantilla.html',   'utf8');

  const pending = queue.filter(k => !done.find(d => d.id === k.id));
  if (pending.length === 0) {
    console.log('No hay keywords pendientes.');
    process.exit(0);
  }

  const kw = pending[0];
  console.log(`Generando: ${kw.keyword}`);

  const hoy = new Date().toISOString().split('T')[0];
  const tieneAsins = Array.isArray(kw.asins) && kw.asins.length > 0;

  // Añadir amazon-box.js a la plantilla si hay productos con ASIN
  const plantillaBase = tieneAsins
    ? plantilla.replace('</head>', '<script src="/js/amazon-box.js" defer></script>\n</head>')
    : plantilla;

  // Formatear ASINs como lista estructurada
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
1. Responde ÚNICAMENTE con el HTML completo. Sin texto antes, sin texto después, sin bloques markdown.
2. Cambia robots a "index, follow"
3. Usa ${hoy} como datePublished en el schema JSON-LD
4. Para posts con ASINs: usa los datos exactos proporcionados (ASIN, imagen URL, precio, título). La caja amazon-box NO lleva descripción ni precio dentro — solo badge + título + botón.
5. El slug va en todas las URLs: canonical, og:url, schema url
6. El post-header-img se deja como div vacío si no hay imagen disponible (la añadirá el usuario después)
7. Sigue todas las instrucciones del prompt maestro: voz, estilo, SEO, estructura, interlinking

PLANTILLA:
${plantillaBase}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: promptMaestro,
    messages: [{ role: 'user', content: mensaje }]
  });

  // Limpiar output: eliminar bloques markdown si Claude los añade
  let html = response.content[0].text.trim();
  html = html.replace(/^```html?\s*/i, '').replace(/\s*```$/, '').trim();

  // Extraer slug del canonical
  const m = html.match(/rel="canonical"\s+href="https:\/\/ramperis\.com\/blog\/([^"]+)"/);
  const slug = m
    ? m[1]
    : kw.keyword.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Guardar post como archivo suelto (no en carpeta)
  fs.writeFileSync(`blog/${slug}.html`, html, 'utf8');
  console.log(`Guardado: blog/${slug}.html`);

  // Actualizar done
  done.push({ id: kw.id, keyword: kw.keyword, slug, published_at: hoy });
  fs.writeFileSync('auto/keywords-done.json', JSON.stringify(done, null, 2), 'utf8');

  // Eliminar de la cola
  fs.writeFileSync('auto/keywords-queue.json', JSON.stringify(queue.filter(k => k.id !== kw.id), null, 2), 'utf8');

  console.log(`✅ https://ramperis.com/blog/${slug}`);
})();
