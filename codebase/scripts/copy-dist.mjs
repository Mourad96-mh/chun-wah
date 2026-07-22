// Recopie le site exporté (codebase/out) vers <racine>/dist, le dossier prêt à
// téléverser dans public_html. Lancé automatiquement après chaque build
// ("postbuild") : sans ça, `dist` reste figé sur un ancien export et on met en
// ligne un site périmé sans s'en apercevoir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const codebase = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(codebase, 'out');
const dist = path.resolve(codebase, '..', 'dist');

if (!fs.existsSync(out)) {
  console.warn('[dist] codebase/out introuvable — rien à copier.');
  process.exit(0);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(out, dist, { recursive: true });

let files = 0;
const count = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) count(path.join(dir, e.name));
    else files += 1;
  }
};
count(dist);

console.log(`[dist] ${files} fichiers copiés vers ${dist}`);
console.log('[dist] téléversez le CONTENU de ce dossier dans public_html.');
