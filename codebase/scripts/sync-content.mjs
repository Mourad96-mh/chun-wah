// Synchronise les articles publiés depuis l'API (Express/Render) vers
// src/lib/articles.data.json, baké dans le HTML statique. Lancé automatiquement
// avant chaque build ("prebuild"). En cas d'échec (API injoignable), on conserve
// le dernier snapshot : le build réussit quand même.
//
// Au fur et à mesure de la migration des autres ressources (livres, cours,
// parcours, vidéos…), ajouter une ligne syncCollection() par collection.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesFile = path.resolve(__dirname, '../src/lib/articles.data.json');
const booksFile = path.resolve(__dirname, '../src/lib/books.data.json');
const programsFile = path.resolve(__dirname, '../src/lib/programs.data.json');

// Charge .env.local (ce script tourne hors de Next, qui sinon lirait le fichier).
function loadEnvLocal() {
  try {
    const file = path.resolve(__dirname, '../.env.local');
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* pas de .env.local — on continue */
  }
}
loadEnvLocal();

const API = process.env.CONTENT_API_URL || process.env.NEXT_PUBLIC_API_URL;

async function syncCollection(endpoint, file, label) {
  try {
    const res = await fetch(`${API}${endpoint}`);
    if (!res.ok) throw new Error(`${API}${endpoint} → HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('réponse inattendue (pas un tableau)');
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`[sync] ${data.length} ${label} synchronisé(e)s depuis ${API}`);
  } catch (e) {
    console.warn(`[sync] échec ${label} — conservation du snapshot existant :`, e.message);
  }
}

async function main() {
  if (!API) {
    console.warn('[sync] CONTENT_API_URL non défini — conservation des snapshots existants');
    return;
  }
  await syncCollection('/api/articles', articlesFile, 'articles');
  await syncCollection('/api/books', booksFile, 'livres');
  await syncCollection('/api/programs', programsFile, 'cours');
  // TODO (migration) : ajouter parcours, vidéos, réglages…
}

main();
