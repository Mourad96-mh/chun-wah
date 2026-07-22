// Génère le jeu d'icônes du site (favicon.ico + PNG) depuis public/favicon.svg.
// Ponctuel : relancer seulement si le SVG source change.
//   npm run icons
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const src = path.join(pub, 'favicon.svg');
// Aux petites tailles le liseré rouge et le glyph se collent : on rend une
// variante sans liseré pour 16/32/48 px, le glyph seul reste lisible.
const srcSmall = path.join(pub, '.favicon-small.svg');

fs.writeFileSync(
  srcSmall,
  fs
    .readFileSync(src, 'utf8')
    .replace(/  <rect x="28".*\n/, '')
    .replace('font-size="300"', 'font-size="340"'),
);

const render = (from, size) =>
  sharp(from, { density: 600 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** Emballe des PNG dans un conteneur .ico (PNG-in-ICO, supporté partout). */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type : icône
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const dir = [];
  for (const { size, data } of entries) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // réservé
    e.writeUInt16LE(1, 4); // plans
    e.writeUInt16LE(32, 6); // bits par pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    dir.push(e);
    offset += data.length;
  }

  return Buffer.concat([header, ...dir, ...entries.map((e) => e.data)]);
}

const icoEntries = [];
for (const size of [16, 32, 48]) {
  icoEntries.push({ size, data: await render(srcSmall, size) });
}
fs.writeFileSync(path.join(pub, 'favicon.ico'), buildIco(icoEntries));

fs.writeFileSync(path.join(pub, 'apple-touch-icon.png'), await render(src, 180));
fs.writeFileSync(path.join(pub, 'icon-192.png'), await render(src, 192));
fs.writeFileSync(path.join(pub, 'icon-512.png'), await render(src, 512));
fs.unlinkSync(srcSmall);

for (const f of ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  console.log(f.padEnd(22), fs.statSync(path.join(pub, f)).size, 'octets');
}
