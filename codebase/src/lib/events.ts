// ---------------------------------------------------------------------------
// Chun Wah — événements de l'académie : COLLECTION + snapshot baké.
//
// CLIENT-SAFE : n'importe jamais Mongoose ni de code serveur. La donnée vient du
// snapshot de build (src/lib/events.data.json), synchronisé depuis l'API Express
// par scripts/sync-content.mjs, et rafraîchie en direct côté client (useLiveData).
//
// Dates en chaînes 'YYYY-MM-DD' (heure 'HH:MM') — pas d'ambiguïté de fuseau. Le
// tri par date fonctionne en comparaison de chaînes tant que le format est fixe.
// ---------------------------------------------------------------------------

import rawEvents from '@/lib/events.data.json';
import type { Localized } from '@/data/types';

/** Événement tel que stocké dans le snapshot / renvoyé par l'API. */
interface EventLean {
  _id: string;
  image?: string;
  titleFr?: string;
  titleEn?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  date?: string;
  endDate?: string;
  time?: string;
  location?: string;
  active?: boolean;
}

/** Événement consommé par le site (texte replié en Localized). */
export interface EventItem {
  id: string;
  image: string;
  title: Localized;
  description: Localized;
  /** 'YYYY-MM-DD'. */
  date: string;
  endDate: string;
  /** 'HH:MM'. */
  time: string;
  location: string;
}

function toEvent(doc: EventLean): EventItem {
  return {
    id: doc._id,
    image: doc.image ?? '',
    title: { fr: doc.titleFr ?? '', en: doc.titleEn ?? '' },
    description: { fr: doc.descriptionFr ?? '', en: doc.descriptionEn ?? '' },
    date: doc.date ?? '',
    endDate: doc.endDate ?? '',
    time: doc.time ?? '',
    location: doc.location ?? '',
  };
}

function sortAndMap(docs: EventLean[]): EventItem[] {
  return [...docs]
    .map(toEvent)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

/** Événements bakés au build (déjà filtrés « actifs » par l'API). */
const bakedEvents: EventItem[] = sortAndMap(rawEvents as EventLean[]);

/** Événements actifs, triés par date (snapshot baké). */
export function getEvents(): EventItem[] {
  return bakedEvents;
}

/** Événements lus EN DIRECT depuis l'API (même shape que le snapshot). */
export async function fetchEvents(): Promise<EventItem[]> {
  const api = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${api}/api/events`);
  if (!res.ok) throw new Error(`GET /api/events → ${res.status}`);
  const raw = (await res.json()) as EventLean[];
  return sortAndMap(raw);
}
