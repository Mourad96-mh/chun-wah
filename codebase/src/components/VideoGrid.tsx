'use client';

import { fetchVideos, type Video } from '@/lib/videos';
import { useLiveData } from '@/lib/useLiveData';
import styles from './VideoShowcase.module.css';

/**
 * Grille des lecteurs vidéo, réalignée sur l'API après chargement (voir
 * useLiveData) : une vidéo ajoutée ou remplacée dans /admin apparaît sans
 * redéployer le site statique.
 */
export default function VideoGrid({ initialVideos }: { initialVideos: Video[] }) {
  const videos = useLiveData(initialVideos, fetchVideos);

  return (
    <div className={styles.grid}>
      {videos.map((v) => (
        <figure key={v.id} className={styles.item}>
          <video
            className={styles.video}
            src={v.videoUrl}
            poster={v.poster || undefined}
            controls
            preload="none"
            playsInline
          />
          <figcaption className={styles.caption}>
            <span className={styles.title}>{v.title}</span>
            {v.description && <span className={styles.desc}>{v.description}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
