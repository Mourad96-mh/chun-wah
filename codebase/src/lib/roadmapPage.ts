// ---------------------------------------------------------------------------
// Chun Wah — textes de la page « Parcours » (chrome de la page : titre, intro,
// accroche/titre de section, bloc CTA). Singleton + snapshot baké.
//
// CLIENT-SAFE : n'importe jamais Mongoose ni de code serveur. La donnée vient du
// snapshot de build (src/lib/roadmapPage.data.json), synchronisé depuis l'API
// Express par scripts/sync-content.mjs, et rafraîchie en direct côté client
// (voir useLiveObject / RoadmapPageContent).
//
// Chaque texte est bilingue et OPTIONNEL : un champ vide retombe sur le texte
// traduit par défaut du site. Le repli est appliqué à l'affichage (la page passe
// les valeurs par défaut, tirées des traductions, au composant client).
// ---------------------------------------------------------------------------

import rawRoadmapPage from '@/lib/roadmapPage.data.json';
import type { Localized } from '@/data/types';

/** Les six textes personnalisables de la page (chacun bilingue, peut être vide). */
export interface RoadmapPageCopy {
  title: Localized;
  intro: Localized;
  kicker: Localized;
  heading: Localized;
  ctaTitle: Localized;
  ctaButton: Localized;
}

type RawCopy = Record<string, unknown>;

function loc(raw: RawCopy, base: string): Localized {
  return {
    fr: String(raw[`${base}Fr`] ?? '').trim(),
    en: String(raw[`${base}En`] ?? '').trim(),
  };
}

/** Normalise un objet brut (snapshot ou réponse API) en RoadmapPageCopy. */
export function normalizeRoadmapPage(raw: unknown): RoadmapPageCopy {
  const r = (raw ?? {}) as RawCopy;
  return {
    title: loc(r, 'title'),
    intro: loc(r, 'intro'),
    kicker: loc(r, 'kicker'),
    heading: loc(r, 'heading'),
    ctaTitle: loc(r, 'ctaTitle'),
    ctaButton: loc(r, 'ctaButton'),
  };
}

/** Textes bakés au build. */
const bakedCopy: RoadmapPageCopy = normalizeRoadmapPage(rawRoadmapPage);

/** Textes de la page (snapshot baké). */
export function getRoadmapPage(): RoadmapPageCopy {
  return bakedCopy;
}

/** Textes lus EN DIRECT depuis l'API (côté client). */
export async function fetchRoadmapPage(): Promise<RoadmapPageCopy> {
  const api = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${api}/api/roadmap-page`);
  if (!res.ok) throw new Error(`GET /api/roadmap-page → ${res.status}`);
  return normalizeRoadmapPage(await res.json());
}
