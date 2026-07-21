import { PDFDocument } from 'pdf-lib';
import { writeFileSync, readdirSync } from 'node:fs';
import sharp from 'sharp';

// Usage: node make-pdf.mjs [sourceDir] [outputPdf]
const DIR = process.argv[2] || 'client-screenshots';
const OUTPUT = process.argv[3] || 'Chun-Wah-maquette-desktop.pdf';
const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.png'))
  .sort();

const pdf = await PDFDocument.create();
// Downscale 2x-retina shots to ~1440px wide and encode as JPEG to keep the PDF email-friendly.
const MAX_W = 1440;

for (const f of files) {
  const jpg = await sharp(`${DIR}/${f}`)
    .resize({ width: MAX_W, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  const img = await pdf.embedJpg(jpg);
  const page = pdf.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
}

const bytes = await pdf.save();
writeFileSync(OUTPUT, bytes);
console.log(
  `PDF created: ${OUTPUT} (${files.length} pages, ${(bytes.length / 1e6).toFixed(1)} MB)`,
);
