import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync } from 'node:fs';

// programs.ts is TypeScript, so it can't be imported here — pull the slugs out
// with a regex instead. Adding a discipline to src/data/programs.ts is enough to
// get it captured; nothing to edit in this file.
const programSlugs = [
  ...readFileSync('src/data/programs.ts', 'utf8').matchAll(/^\s{4}slug: '([^']+)'/gm),
].map((m) => m[1]);
if (!programSlugs.length) throw new Error('No program slugs found in src/data/programs.ts');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:4178';

// Usage: node shoot.mjs [desktop|mobile|both] [fr|en|both]
const which = (process.argv[2] || 'both').toLowerCase();
const wantLocale = (process.argv[3] || 'fr').toLowerCase();

// Route lists per locale. EN uses the localized pathnames from src/i18n/routing.ts;
// blog + livres are French-only (the EN routes redirect) so they are FR-only here.
const routesFor = (locale) => {
  const seg = locale === 'en'
    ? { cours: 'programs', instructeurs: 'instructors', horaires: 'schedule', essai: 'free-trial-class' }
    : { cours: 'cours', instructeurs: 'instructeurs', horaires: 'horaires', essai: 'cours-essai-gratuit' };

  const list = [
    ['01-accueil', ''],
    ['02-cours', `/${seg.cours}`],
    ...programSlugs.map((slug, i) => [
      `${String(i + 3).padStart(2, '0')}-cours-${slug}`,
      `/${seg.cours}/${slug}`,
    ]),
  ];
  let n = list.length + 1;
  const push = (name, path) => list.push([`${String(n++).padStart(2, '0')}-${name}`, path]);
  push('instructeurs', `/${seg.instructeurs}`);
  push('horaires', `/${seg.horaires}`);
  push('essai-gratuit', `/${seg.essai}`);
  push('contact', '/contact');
  if (locale === 'fr') {
    push('blog', '/blog');
    push('livres', '/livres');
  }
  return list.map(([name, path]) => [name, `/${locale}${path}`]);
};

const locales = wantLocale === 'both' ? ['fr', 'en'] : [wantLocale];

const profiles = [
  { id: 'desktop', suffix: '', width: 1440, height: 900, dsf: 2, mobile: false },
  { id: 'mobile', suffix: '-mobile', width: 390, height: 844, dsf: 2, mobile: true },
].filter((p) => which === 'both' || which === p.id);

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--hide-scrollbars'],
});

for (const locale of locales) {
  const pages = routesFor(locale);
  for (const p of profiles) {
    // fr → client-screenshots / client-screenshots-mobile (same names as other projects)
    // en → client-screenshots-en / client-screenshots-en-mobile
    const dir = `client-screenshots${locale === 'fr' ? '' : '-en'}${p.suffix}`;
    mkdirSync(dir, { recursive: true });
    const page = await browser.newPage();
    await page.setViewport({
      width: p.width,
      height: p.height,
      deviceScaleFactor: p.dsf,
      isMobile: p.mobile,
      hasTouch: p.mobile,
    });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

    for (const [name, route] of pages) {
      await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      // Open every <details> so the FAQ answers are visible in the capture.
      await page.evaluate(() => {
        document.querySelectorAll('details').forEach((d) => (d.open = true));
      });
      // The clip capture doesn't scroll, so below-fold loading="lazy" images would
      // stay blank. Scroll through the whole page to trigger native lazy-loading,
      // return to top, then wait for every image to fully decode.
      await page.evaluate(async () => {
        await new Promise((res) => {
          let y = 0;
          const step = () => {
            window.scrollTo(0, y);
            y += window.innerHeight;
            if (y < document.body.scrollHeight) setTimeout(step, 50);
            else { window.scrollTo(0, 0); setTimeout(res, 200); }
          };
          step();
        });
        const imgs = [...document.querySelectorAll('img')];
        await Promise.all(
          imgs.map(async (i) => {
            if (!i.complete) await new Promise((r) => { i.onload = i.onerror = r; });
            try { await i.decode(); } catch {}
          }),
        );
      });
      await new Promise((r) => setTimeout(r, 400));
      const file = `${dir}/${name}.png`;
      // Manual clip keeps the layout viewport fixed so vh-based heights (the hero is
      // clamp(520px, 78vh, 760px)) don't balloon — fullPage resizes the viewport.
      const dims = await page.evaluate(() => ({
        w: document.documentElement.clientWidth,
        h: document.documentElement.scrollHeight,
      }));
      // Chromium's capture surface maxes out at 16384px per side. Cap the scale factor
      // so a tall page's device-pixel height stays under it (otherwise it wraps/duplicates).
      const MAX_PX = 16000;
      const safeDsf = Math.min(p.dsf, MAX_PX / dims.h);
      const setDsf = (d) => page.setViewport({
        width: p.width, height: p.height, deviceScaleFactor: d,
        isMobile: p.mobile, hasTouch: p.mobile,
      });
      if (safeDsf < p.dsf) await setDsf(safeDsf);
      await page.screenshot({
        path: file,
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: dims.w, height: dims.h },
      });
      if (safeDsf < p.dsf) await setDsf(p.dsf);
      console.log(`[${locale}/${p.id}] ${name} -> ${file}  (h=${dims.h}px, ${safeDsf.toFixed(2)}x)`);
    }
    await page.close();
  }
}

await browser.close();
console.log('DONE');
