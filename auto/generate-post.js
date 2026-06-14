'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

(async function () {
  const client = new Anthropic();

  // Leer cola de keywords
  const queue = JSON.parse(fs.readFileSync('auto/keywords-queue.json', 'utf8'));
  const done = JSON.parse(fs.readFileSync('auto/keywords-done.json', 'utf8'));
  const promptMaestro = fs.readFileSync('auto/prompt-maestro.md', 'utf8');

  // Coger la primera keyword pendiente
  const pending = queue.filter(k => !done.find(d => d.id === k.id));
  if (pending.length === 0) {
    console.log('No hay keywords pendientes.');
    process.exit(0);
  }

  const keyword = pending[0];
  console.log(`Generando post para: ${keyword.keyword}`);

  // Construir el input para el agente
  const input = `
KEYWORD: ${keyword.keyword}
TIPO: ${keyword.tipo}
KEYWORDS_SECUNDARIAS: ${keyword.keywords_secundarias.join(', ')}
LONG_TAIL: ${keyword.long_tail.join(', ')}
ASINS: ${keyword.asins.length > 0 ? keyword.asins.join(', ') : 'ninguno'}
NOTAS: ${keyword.notas}
`;

  // Llamar a Claude API
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: promptMaestro,
    messages: [{ role: 'user', content: input }]
  });

  const content = response.content[0].text;

  // Extraer slug del contenido generado
  const slugMatch = content.match(/CANONICAL: https:\/\/ramperis\.com\/blog\/([^\s\n]+)/);
  const slug = slugMatch
    ? slugMatch[1]
    : keyword.keyword.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Guardar el post
  const postDir = `blog/${slug}`;
  if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true });
  fs.writeFileSync(`${postDir}/index.html`, content);

  console.log(`Post guardado en: ${postDir}/index.html`);

  // Mover keyword a done
  done.push({ ...keyword, published_at: new Date().toISOString(), slug });
  fs.writeFileSync('auto/keywords-done.json', JSON.stringify(done, null, 2));

  // Eliminar keyword procesada de la cola
  const newQueue = queue.filter(k => k.id !== keyword.id);
  fs.writeFileSync('auto/keywords-queue.json', JSON.stringify(newQueue, null, 2));

  console.log(`✅ Post publicado: ${slug}`);
})();
