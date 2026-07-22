'use client';

import { fetchMediaMap, type MediaMap } from '@/lib/media';
import { useLiveObject } from '@/lib/useLiveObject';
import Photo from './Photo';

/**
 * Photo pilotée depuis /admin/medias, réalignée sur l'API après chargement :
 * remplacer l'image du hero ou de la section « à propos » ne demande plus de
 * redéployer le site statique.
 *
 * `initialMedia` est la carte bakée au build — le HTML servi contient donc déjà
 * la bonne image (SEO, visiteurs sans JS).
 */
export default function LivePhoto({
  slot,
  initialMedia,
  src,
  fallbackAlt,
  priority,
  sizes,
}: {
  /** Clé d'emplacement, ex. 'hero' ou 'academy' (voir MEDIA_SLOTS). */
  slot: string;
  initialMedia: MediaMap;
  /** Chemin du visuel de secours quand aucune image n'est téléversée. */
  src: string;
  /** Texte alternatif par défaut si l'admin n'en a pas saisi. */
  fallbackAlt: string;
  priority?: boolean;
  sizes?: string;
}) {
  const media = useLiveObject(initialMedia, fetchMediaMap);
  const asset = media[slot];

  return (
    <Photo
      src={src}
      url={asset?.url}
      alt={asset?.alt || fallbackAlt}
      priority={priority}
      sizes={sizes}
    />
  );
}
