import rawMedia from '@/lib/media.data.json';
import { instructors } from '@/data/instructors';

/**
 * Seam pour les images pilotées par le client. La donnée vient désormais du
 * snapshot baké au build (src/lib/media.data.json, synchronisé depuis l'API
 * Express par scripts/sync-content.mjs) — plus de Mongo ni d'unstable_cache,
 * compatible export statique. L'API publique de ce module (getMediaMap,
 * MEDIA_SLOTS, MEDIA_KEYS, types) est INCHANGÉE : instructeurs, home, horaires,
 * pages cours l'appellent tel quel. Seule la source de données a changé.
 */

/** Conservé pour compat avec l'ancienne route Next encore présente (no-op). */
export const MEDIA_TAG = 'media-assets';

export interface MediaSlot {
  key: string;
  /** Libellé admin (français). */
  label: string;
  hint?: string;
}

/**
 * Les emplacements d'images gérables depuis /admin/medias. Les emplacements
 * instructeur sont dérivés du fichier de contenu pour rester synchronisés avec
 * le roster.
 */
export const MEDIA_SLOTS: MediaSlot[] = [
  {
    key: 'hero',
    label: 'Accueil — image principale (hero)',
    hint: 'Grande photo en haut de la page d’accueil. Format paysage, ~1920×1080.',
  },
  {
    key: 'academy',
    label: 'Accueil — image « À propos »',
    hint: 'Photo de la section présentation de l’académie. ~1200×900.',
  },
  ...instructors.map((i) => ({
    key: `instructor:${i.slug}`,
    label: `Instructeur — ${i.name}`,
    hint: 'Portrait, format vertical de préférence (~600×800).',
  })),
];

export const MEDIA_KEYS: string[] = MEDIA_SLOTS.map((s) => s.key);

export interface MediaAsset {
  url: string;
  alt: string;
  /** Nom d'affichage (emplacements instructeur). */
  name: string;
}

export type MediaMap = Record<string, MediaAsset>;

type RawItem = { slot?: string; url?: string; alt?: string; name?: string };

/**
 * Images téléversées, indexées par emplacement, lues par les pages. Construites
 * depuis le snapshot baké : un emplacement sans contenu n'apparaît pas (le site
 * retombe sur son placeholder).
 */
export async function getMediaMap(): Promise<MediaMap> {
  return toMediaMap((rawMedia as { items?: RawItem[] }).items ?? []);
}

/** Construit la carte depuis un tableau brut (snapshot ou réponse API). */
export function toMediaMap(items: RawItem[]): MediaMap {
  const map: MediaMap = {};
  for (const item of items) {
    const slot = String(item.slot ?? '');
    if (MEDIA_KEYS.includes(slot) && (item.url || item.alt || item.name)) {
      map[slot] = { url: item.url ?? '', alt: item.alt ?? '', name: item.name ?? '' };
    }
  }
  return map;
}

/**
 * Carte des images lue EN DIRECT depuis l'API (côté client) : une photo
 * remplacée dans /admin/medias apparaît sans redéployer le site statique.
 */
// Plusieurs composants (hero, « à propos », roster) demandent la même carte au
// même moment : on mémoïse la promesse pour ne faire qu'un appel par page.
let mediaMapPromise: Promise<MediaMap> | null = null;

export async function fetchMediaMap(): Promise<MediaMap> {
  if (!mediaMapPromise) {
    const api = process.env.NEXT_PUBLIC_API_URL || '';
    mediaMapPromise = fetch(`${api}/api/media`)
      .then((res) => {
        if (!res.ok) throw new Error(`GET /api/media → ${res.status}`);
        return res.json() as Promise<{ items?: RawItem[] }>;
      })
      .then((data) => toMediaMap(data.items ?? []))
      .catch((err) => {
        // Un échec ne doit pas figer le cache : la navigation suivante réessaie.
        mediaMapPromise = null;
        throw err;
      });
  }
  return mediaMapPromise;
}
