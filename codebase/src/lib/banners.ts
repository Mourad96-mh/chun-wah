import rawBanners from '@/lib/banners.data.json';
import type { Localized } from '@/data/types';

/**
 * Seam pour les diapositives du hero d'accueil. Même patron que programs.ts /
 * media.ts : la donnée vient du snapshot baké au build
 * (src/lib/banners.data.json, synchronisé depuis l'API Express par
 * scripts/sync-content.mjs), compatible export statique, et se rafraîchit en
 * direct côté client (voir useLiveData / le composant Hero).
 *
 * Le texte est bilingue : l'API stocke titleFr/titleEn/subtitleFr/subtitleEn ;
 * ce module les replie en champs `Localized` pour que le site lise `title[locale]`.
 */

/** Diapositive telle que stockée dans le snapshot / renvoyée par l'API. */
interface BannerLean {
  _id: string;
  image: string;
  imageMobile?: string;
  titleFr?: string;
  titleEn?: string;
  subtitleFr?: string;
  subtitleEn?: string;
  order?: number;
  active?: boolean;
}

/** Diapositive consommée par le site (texte replié en Localized). */
export interface Banner {
  id: string;
  image: string;
  imageMobile: string;
  title: Localized;
  subtitle: Localized;
}

function toBanner(doc: BannerLean): Banner {
  return {
    id: doc._id,
    image: doc.image ?? '',
    imageMobile: doc.imageMobile ?? '',
    title: { fr: doc.titleFr ?? '', en: doc.titleEn ?? '' },
    subtitle: { fr: doc.subtitleFr ?? '', en: doc.subtitleEn ?? '' },
  };
}

function sortAndMap(docs: BannerLean[]): Banner[] {
  return [...docs]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(toBanner)
    .filter((b) => b.image);
}

/** Diapositives bakées au build (déjà filtrées « actives » par l'API). */
const bakedBanners: Banner[] = sortAndMap(rawBanners as BannerLean[]);

/** Diapositives actives, dans l'ordre d'affichage (snapshot baké). */
export function getBanners(): Banner[] {
  return bakedBanners;
}

/** Diapositives lues EN DIRECT depuis l'API (même shape que le snapshot). */
export async function fetchBanners(): Promise<Banner[]> {
  const api = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${api}/api/banners`);
  if (!res.ok) throw new Error(`GET /api/banners → ${res.status}`);
  const raw = (await res.json()) as BannerLean[];
  return sortAndMap(raw);
}
