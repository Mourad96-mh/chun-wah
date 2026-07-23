// ---------------------------------------------------------------------------
// Chun Wah — parcours de l'élève : COLLECTION d'étapes + snapshot baké.
//
// CLIENT-SAFE : n'importe jamais Mongoose ni de code serveur. La donnée vient du
// snapshot de build (src/lib/roadmap.data.json), synchronisé depuis l'API
// Express par scripts/sync-content.mjs — compatible export statique, rafraîchi
// en direct côté client (voir useLiveData / RoadmapTimeline).
//
// Chaque étape = une image + un titre + une description, bilingue (même patron
// que les bannières). L'endpoint public ne renvoie que les étapes ACTIVES.
// ---------------------------------------------------------------------------

import rawRoadmap from '@/lib/roadmap.data.json';
import type { Localized } from '@/data/types';

/** Étape telle que stockée dans le snapshot / renvoyée par l'API. */
interface RoadmapStepLean {
  _id: string;
  image: string;
  titleFr?: string;
  titleEn?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  order?: number;
  active?: boolean;
}

/** Étape consommée par le site (texte replié en Localized). */
export interface RoadmapStep {
  id: string;
  image: string;
  title: Localized;
  description: Localized;
}

function toStep(doc: RoadmapStepLean): RoadmapStep {
  return {
    id: doc._id,
    image: doc.image ?? '',
    title: { fr: doc.titleFr ?? '', en: doc.titleEn ?? '' },
    description: { fr: doc.descriptionFr ?? '', en: doc.descriptionEn ?? '' },
  };
}

function sortAndMap(docs: RoadmapStepLean[]): RoadmapStep[] {
  return [...docs]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(toStep)
    .filter((s) => s.image);
}

/** Étapes bakées au build (déjà filtrées « actives » par l'API). */
const bakedSteps: RoadmapStep[] = sortAndMap(rawRoadmap as RoadmapStepLean[]);

/** Étapes du parcours, dans l'ordre d'affichage (snapshot baké). */
export function getRoadmapSteps(): RoadmapStep[] {
  return bakedSteps;
}

/** Étapes lues EN DIRECT depuis l'API (même shape que le snapshot). */
export async function fetchRoadmapSteps(): Promise<RoadmapStep[]> {
  const api = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${api}/api/roadmap`);
  if (!res.ok) throw new Error(`GET /api/roadmap → ${res.status}`);
  const raw = (await res.json()) as RoadmapStepLean[];
  return sortAndMap(raw);
}
