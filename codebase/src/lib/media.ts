import { unstable_cache } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Media } from '@/models/Media';
import { instructors } from '@/data/instructors';

/** Cache tag tying every page's media read to the admin save (revalidateTag). */
export const MEDIA_TAG = 'media-assets';

export interface MediaSlot {
  key: string;
  /** Admin-facing label (French). */
  label: string;
  hint?: string;
}

/**
 * The image slots the client can manage from /admin/medias. Instructor slots are
 * derived from the content file so they stay in sync with the roster. Add a row
 * (or another `instructors`-style map) to expose more images — the admin UI, the
 * API validation and the render sites all read from this single list.
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
  /** Display-name override, used by instructor slots. */
  name: string;
}

export type MediaMap = Record<string, MediaAsset>;

async function readMedia(): Promise<MediaMap> {
  await dbConnect();
  const doc = await Media.findOne({ key: 'main' })
    .select('items')
    .lean<{ items?: { slot: string; url: string; alt: string; name: string }[] }>();

  const map: MediaMap = {};
  for (const item of doc?.items ?? []) {
    // Surface known slots that carry any content. A slot with none means "use the
    // defaults", so it must not appear in the map.
    if (MEDIA_KEYS.includes(item.slot) && (item.url || item.alt || item.name)) {
      map[item.slot] = { url: item.url ?? '', alt: item.alt ?? '', name: item.name ?? '' };
    }
  }
  return map;
}

const cachedMedia = unstable_cache(readMedia, ['media-assets'], { tags: [MEDIA_TAG] });

/**
 * Uploaded images keyed by slot, read by the render sites. Never throws: a DB
 * hiccup degrades to an empty map, i.e. every image falls back to its placeholder.
 */
export async function getMediaMap(): Promise<MediaMap> {
  try {
    return await cachedMedia();
  } catch (err) {
    console.error('[media] unavailable, falling back to placeholders:', err);
    return {};
  }
}
