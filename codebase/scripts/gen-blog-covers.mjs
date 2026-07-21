/**
 * Generates the on-brand SVG cover images for the seeded blog articles, written
 * to public/blog/<slug>.svg. Run once after editing the list:
 *
 *   node scripts/gen-blog-covers.mjs
 *
 * These are lightweight illustrated covers (dark field + a large faded kung-fu
 * character + kicker + title) so the blog looks finished without stock photos.
 * The client can replace any cover with a real photo from the admin dashboard.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const COVERS = [
  { slug: 'debuter-wing-chun-adulte', kicker: 'WING CHUN · DÉBUTANTS', char: '詠', lines: ['Débuter le Wing Chun', 'à l’âge adulte'] },
  { slug: 'trois-principes-wing-chun', kicker: 'WING CHUN · TECHNIQUE', char: '春', lines: ['Les 3 principes du', 'Wing Chun'] },
  { slug: 'self-defense-feminine-reflexes', kicker: 'SELF-DÉFENSE · FEMMES', char: '護', lines: ['Self-défense féminine :', '5 réflexes simples'] },
  { slug: 'initier-enfant-kung-fu', kicker: 'KUNG-FU · ENFANTS', char: '童', lines: ['Initier son enfant', 'au kung-fu'] },
  { slug: 'sanda-boxe-chinoise-explique', kicker: 'SANDA · COMBAT', char: '散', lines: ['Le Sanda expliqué :', 'la boxe chinoise'] },
  { slug: 'tai-chi-qi-gong-bienfaits', kicker: 'TAÏ-CHI & QI GONG', char: '氣', lines: ['Taï-chi & Qi Gong :', 'bouger pour se renforcer'] },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svg({ kicker, char, lines }) {
  const titleY = 380;
  const titleLines = lines
    .map((l, i) => `<text x="80" y="${titleY + i * 74}" font-size="62" font-weight="700" fill="#ffffff">${esc(l)}</text>`)
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" font-family="'Arial Narrow', 'Helvetica Neue', Arial, sans-serif">
  <defs>
    <pattern id="d" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="#ffffff" opacity="0.05"/>
    </pattern>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0.45" stop-color="#141518"/>
      <stop offset="1" stop-color="#141518" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="1280" height="720" fill="#141518"/>
  <rect width="1280" height="720" fill="url(#d)"/>

  <!-- Large faded kung-fu character bleeding off the right edge -->
  <text x="1180" y="600" font-size="620" font-weight="700" fill="#c2352b" opacity="0.22" text-anchor="end">${esc(char)}</text>
  <rect width="1280" height="720" fill="url(#fade)"/>

  <!-- Kicker + accent rule -->
  <text x="80" y="250" font-size="26" font-weight="700" fill="#e0554b" letter-spacing="4">${esc(kicker)}</text>
  <rect x="80" y="270" width="72" height="4" fill="#c2352b"/>

  <!-- Title -->
  ${titleLines}

  <!-- Brand footer -->
  <text x="80" y="650" font-size="22" font-weight="700" fill="#8a8f98" letter-spacing="3">詠 &#160;ACADÉMIE CHUN WAH · RABAT</text>
</svg>
`;
}

const dir = resolve(process.cwd(), 'public/blog');
mkdirSync(dir, { recursive: true });

for (const cover of COVERS) {
  const file = resolve(dir, `${cover.slug}.svg`);
  writeFileSync(file, svg(cover), 'utf8');
  console.log('wrote', `public/blog/${cover.slug}.svg`);
}
