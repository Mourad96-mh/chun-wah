// ---------------------------------------------------------------------------
// Chun Wah — textes libres de la page d'accueil (pour l'instant la section
// « à propos »). Singleton + snapshot baké.
//
// CLIENT-SAFE : n'importe jamais Mongoose ni de code serveur. La donnée vient du
// snapshot de build (src/lib/homePage.data.json), synchronisé depuis l'API
// Express par scripts/sync-content.mjs, et rafraîchie en direct côté client
// (voir useLiveObject / AboutSection).
//
// Chaque texte est bilingue et OPTIONNEL : un champ vide retombe sur la
// traduction par défaut du site (messages/{fr,en}.json → home.about*). Le repli
// est appliqué à l'affichage — la page serveur passe les valeurs traduites au
// composant client, qui choisit entre les deux. Même contrat que roadmapPage.ts.
// ---------------------------------------------------------------------------

import rawHomePage from '@/lib/homePage.data.json';
import type { Localized } from '@/data/types';

/** Les textes personnalisables de l'accueil (chacun bilingue, peut être vide). */
export interface HomePageCopy {
  aboutKicker: Localized;
  aboutTitle: Localized;
  aboutBody: Localized;
}

type RawCopy = Record<string, unknown>;

function loc(raw: RawCopy, base: string): Localized {
  return {
    fr: String(raw[`${base}Fr`] ?? '').trim(),
    en: String(raw[`${base}En`] ?? '').trim(),
  };
}

/** Normalise un objet brut (snapshot ou réponse API) en HomePageCopy. */
export function normalizeHomePage(raw: unknown): HomePageCopy {
  const r = (raw ?? {}) as RawCopy;
  return {
    aboutKicker: loc(r, 'aboutKicker'),
    aboutTitle: loc(r, 'aboutTitle'),
    aboutBody: loc(r, 'aboutBody'),
  };
}

/** Textes bakés au build. */
const bakedCopy: HomePageCopy = normalizeHomePage(rawHomePage);

/** Textes de l'accueil (snapshot baké). */
export function getHomePage(): HomePageCopy {
  return bakedCopy;
}

/** Textes lus EN DIRECT depuis l'API (côté client). */
export async function fetchHomePage(): Promise<HomePageCopy> {
  const api = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${api}/api/home-page`);
  if (!res.ok) throw new Error(`GET /api/home-page → ${res.status}`);
  return normalizeHomePage(await res.json());
}
