'use client';

import { useTranslations } from 'next-intl';
import { fetchRoadmap, type Roadmap } from '@/lib/roadmap';
import { useLiveObject } from '@/lib/useLiveObject';
import styles from '@/app/[locale]/parcours/parcours.module.css';

/** Une URL pointe un PDF quand son chemin finit par .pdf (hors query string). */
function isPdf(url: string): boolean {
  return /\.pdf(\?.*)?$/i.test(url);
}

/**
 * Schéma du parcours (image ou PDF), réaligné sur l'API après chargement :
 * remplacer l'illustration depuis /admin/parcours ne demande plus de
 * redéployer le site statique.
 */
export default function RoadmapFigure({ initialRoadmap }: { initialRoadmap: Roadmap }) {
  const t = useTranslations('roadmap');
  const roadmap = useLiveObject(initialRoadmap, fetchRoadmap);

  const image = roadmap.imageUrl;
  const file = roadmap.fileUrl;
  const showPdfEmbed = !image && !!file && isPdf(file);
  const hasContent = !!image || showPdfEmbed;

  if (!hasContent) {
    return (
      <p className="lead" style={{ textAlign: 'center' }}>
        {t('empty')}
      </p>
    );
  }

  return (
    <figure className={styles.mapFrame}>
      <div className={styles.mapInner}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={roadmap.imageAlt || t('title')} className={styles.mapImage} />
        ) : (
          <iframe
            src={`${file}#view=FitH`}
            title={roadmap.imageAlt || t('title')}
            className={styles.mapPdf}
            loading="lazy"
          />
        )}
      </div>

      {roadmap.note && <figcaption className={styles.caption}>{roadmap.note}</figcaption>}

      {file && (
        <div className={styles.actions}>
          <a
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.download}
            download
          >
            ↓ {isPdf(file) ? t('downloadPdf') : t('download')}
          </a>
        </div>
      )}
    </figure>
  );
}
