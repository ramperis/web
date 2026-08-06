const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG_DIR = path.join(__dirname, 'img');
const MAX_WIDTH = 1200;
const QUALITY = 80;
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const EXCLUDE = new Set([path.join(IMG_DIR, 'favicon.png')]);

function walk(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(full));
    else files.push(full);
  }
  return files;
}

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  if (!EXTENSIONS.has(ext) || EXCLUDE.has(file)) return null;

  const outFile = file.slice(0, -ext.length) + '.webp';
  const beforeSize = fs.statSync(file).size;

  const buffer = await sharp(file)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  fs.writeFileSync(outFile, buffer);
  fs.unlinkSync(file);

  const afterSize = buffer.length;
  return { from: file, to: outFile, beforeSize, afterSize };
}

async function main() {
  const files = walk(IMG_DIR);
  const results = [];
  for (const file of files) {
    const result = await optimize(file);
    if (result) {
      results.push(result);
      const kb = n => (n / 1024).toFixed(0);
      console.log(`${path.relative(IMG_DIR, result.from)} -> ${path.basename(result.to)}  (${kb(result.beforeSize)}KB -> ${kb(result.afterSize)}KB)`);
    }
  }

  const totalBefore = results.reduce((n, r) => n + r.beforeSize, 0);
  const totalAfter = results.reduce((n, r) => n + r.afterSize, 0);
  console.log(`\n${results.length} imágenes convertidas. ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
}

main().catch(err => { console.error(err); process.exit(1); });
