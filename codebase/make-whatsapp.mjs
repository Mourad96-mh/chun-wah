import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

/**
 * WhatsApp re-encodes anything sent as a *photo* and caps the longest side at
 * ~1600px. A 11000px-tall full-page capture therefore arrives unreadable.
 *
 * This slices each capture into portrait tiles that are already under that cap,
 * so WhatsApp has nothing left to shrink and the text stays legible in-chat.
 *
 * Usage: node make-whatsapp.mjs [sourceDir] [outputDir]
 */
const SRC = process.argv[2] || 'client-screenshots';
const OUT = process.argv[3] || `whatsapp/${SRC.replace(/^client-screenshots-?/, '') || 'desktop'}`;

const MAX_W = 1080;      // WhatsApp's own upload width — no downscale on arrival
const MAX_TILE_H = 1440; // 3:4, comfortably under the ~1600px cap
const OVERLAP = 48;      // repeat a sliver across the seam so no line is cut in half

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith('.png')).sort();
let total = 0;

for (const f of files) {
  const base = f.replace(/\.png$/, '');
  // Never enlarge: the mobile captures are 390 CSS px at 2x = 780px wide. Blowing
  // them up to 1080 would soften the text AND inflate every page's height, which
  // is what drives the tile count (the 390px home went from 8 tiles to 22).
  const resized = sharp(`${SRC}/${f}`).resize({ width: MAX_W, withoutEnlargement: true });
  const buf = await resized.png().toBuffer();
  const { width, height } = await sharp(buf).metadata();

  const count = Math.max(1, Math.ceil(height / MAX_TILE_H));
  // Even distribution rather than fixed-height tiles: a fixed height leaves a
  // final sliver (e.g. 80px of footer) that reads as a mistake in the chat.
  const step = Math.ceil(height / count);

  for (let i = 0; i < count; i++) {
    const top = Math.max(0, i * step - (i > 0 ? OVERLAP : 0));
    const h = Math.min(height - top, step + (i > 0 ? OVERLAP : 0));
    const suffix = count > 1 ? `-${String(i + 1).padStart(2, '0')}` : '';
    const jpg = await sharp(buf)
      .extract({ left: 0, top, width, height: h })
      .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toBuffer();
    writeFileSync(`${OUT}/${base}${suffix}.jpg`, jpg);
    total++;
  }
  console.log(`${f} (${height}px) -> ${count} tile${count > 1 ? 's' : ''}`);
}

console.log(`\n${total} images in ${OUT}/ — send from the gallery, they are already WhatsApp-sized.`);
