'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import { fetchRoadmapSteps, type RoadmapStep } from '@/lib/roadmap';
import { useLiveData } from '@/lib/useLiveData';
import styles from '@/app/[locale]/parcours/parcours.module.css';

/**
 * Frise verticale du parcours de l'élève : une étape par carte (image + titre +
 * description), reliées par un fil numéroté. Réalignée sur l'API après
 * chargement — ajouter ou modifier une étape dans /admin/parcours apparaît sans
 * redéployer le site statique.
 *
 * `initialSteps` est le snapshot baké au build : le HTML servi contient déjà les
 * étapes (SEO, visiteurs sans JS).
 */
export default function RoadmapTimeline({ initialSteps }: { initialSteps: RoadmapStep[] }) {
  const t = useTranslations('roadmap');
  const locale = useLocale() as Locale;
  const steps = useLiveData(initialSteps, fetchRoadmapSteps);

  if (!steps.length) {
    return (
      <p className="lead" style={{ textAlign: 'center' }}>
        {t('empty')}
      </p>
    );
  }

  return (
    <ol className={styles.timeline}>
      {steps.map((step, i) => {
        const title = step.title[locale].trim();
        const description = step.description[locale].trim();
        return (
          <li key={step.id} className={styles.step}>
            <div className={styles.stepNode} aria-hidden>
              {i + 1}
            </div>
            <div className={styles.stepCard}>
              {step.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.stepImage}
                  src={step.image}
                  alt={title || ''}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              )}
              <div className={styles.stepBody}>
                {title && <h3 className={styles.stepTitle}>{title}</h3>}
                {description && <p className={styles.stepText}>{description}</p>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
