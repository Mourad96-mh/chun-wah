// ---------------------------------------------------------------------------
// Chun Wah — frise chronologique « Notre histoire » : COLLECTION + snapshot baké.
//
// CLIENT-SAFE : n'importe jamais Mongoose ni de code serveur. La donnée vient du
// snapshot de build (src/lib/history.data.json), synchronisé depuis l'API Express
// par scripts/sync-content.mjs, et rafraîchie en direct côté client (useLiveData).
//
// Chaque jalon = une étiquette d'année + un titre + une description (bilingue) +
// une image facultative. L'ordre vient de `order` (étiquettes libres possibles).
// ---------------------------------------------------------------------------

import rawHistory from '@/lib/history.data.json';
import type { Localized } from '@/data/types';

/** Jalon tel que stocké dans le snapshot / renvoyé par l'API. */
interface MilestoneLean {
  _id: string;
  year: string;
  titleFr?: string;
  titleEn?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  image?: string;
  order?: number;
  active?: boolean;
}

/** Jalon consommé par le site (texte replié en Localized). */
export interface Milestone {
  id: string;
  year: string;
  title: Localized;
  description: Localized;
  image: string;
}

function toMilestone(doc: MilestoneLean): Milestone {
  return {
    id: doc._id,
    year: doc.year ?? '',
    title: { fr: doc.titleFr ?? '', en: doc.titleEn ?? '' },
    description: { fr: doc.descriptionFr ?? '', en: doc.descriptionEn ?? '' },
    image: doc.image ?? '',
  };
}

function sortAndMap(docs: MilestoneLean[]): Milestone[] {
  return [...docs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(toMilestone);
}

/** Jalons bakés au build (déjà filtrés « actifs » par l'API). */
export const milestones: Milestone[] = sortAndMap(rawHistory as MilestoneLean[]);

/** Jalons lus EN DIRECT depuis l'API (même shape que le snapshot). */
export async function fetchMilestones(): Promise<Milestone[]> {
  const api = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${api}/api/history`);
  if (!res.ok) throw new Error(`GET /api/history → ${res.status}`);
  const raw = (await res.json()) as MilestoneLean[];
  return sortAndMap(raw);
}
