// Génère le logo web et le jeu d'icônes depuis assets/logo.jpeg (le fichier
// fourni par l'académie, conservé tel quel comme source de vérité).
// Ponctuel : relancer seulement si le logo source change.
//   npm run icons
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const src = path.join(root, 'assets', 'logo.jpeg');

// Géométrie relevée sur le JPEG source (960 × 960) :
//   - le sceau (liseré noir) est centré en (485, 455), rayon 366 px ;
//   - la tête de dragon est centrée en (478, 450), rayon utile 240 px.
// Tout est exprimé en centre + rayon pour rester lisible si le source change.
const disc = { cx: 485, cy: 455, r: 370 }; // sceau complet, + 4 px de marge
const detail = { cx: 478, cy: 450, r: 240 }; // tête de dragon seule
const padded = { cx: 485, cy: 455, r: 405 }; // sceau + fond papier autour

const extract = ({ cx, cy, r }) => ({
  left: cx - r,
  top: cy - r,
  width: r * 2,
  height: r * 2,
});

const circleMask = (size) =>
  Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );

/** Découpe ronde, fond transparent hors du cercle. */
const round = (crop, size, opts = {}) =>
  sharp(src)
    .extract(extract(crop))
    .resize(size, size)
    .ensureAlpha()
    .composite([{ input: circleMask(size), blend: 'dest-in' }])
    .png({ compressionLevel: 9, ...opts })
    .toBuffer();

/** Découpe carrée opaque : le fond papier du logo sert de fond d'icône.
 *  iOS et Android n'aiment pas la transparence sur ces icônes-là (rendue en
 *  noir pour l'une, sur un fond imposé pour l'autre) : on reste opaque. */
const square = (crop, size, opts = {}) =>
  sharp(src)
    .extract(extract(crop))
    .resize(size, size)
    .png({ compressionLevel: 9, ...opts })
    .toBuffer();

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

// Logo web : le sceau détouré, réutilisable sur n'importe quel fond.
fs.writeFileSync(path.join(pub, 'logo.png'), await round(disc, 512, { palette: true }));

// Favicon : à 16 px le liseré et « CHUN WAH MOROCCO » ne sont plus qu'un halo.
// On recadre donc sur la tête de dragon, seul élément encore lisible.
const icoEntries = [];
for (const size of [16, 32, 48]) {
  icoEntries.push({ size, data: await round(detail, size) });
}
fs.writeFileSync(path.join(pub, 'favicon.ico'), buildIco(icoEntries));

// Icônes d'application : sceau entier, opaque, avec un peu d'air autour.
fs.writeFileSync(path.join(pub, 'apple-touch-icon.png'), await square(padded, 180, { palette: true }));
fs.writeFileSync(path.join(pub, 'icon-192.png'), await square(padded, 192, { palette: true }));
fs.writeFileSync(path.join(pub, 'icon-512.png'), await square(padded, 512, { palette: true }));

for (const f of ['logo.png', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  console.log(f.padEnd(22), fs.statSync(path.join(pub, f)).size, 'octets');
}
