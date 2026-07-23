'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { RoadmapStep } from '@/lib/roadmap';
import {
  fetchRoadmapPage,
  type RoadmapPageCopy,
} from '@/lib/roadmapPage';
import { useLiveObject } from '@/lib/useLiveObject';
import PageHeader from '@/components/PageHeader';
import RoadmapTimeline from '@/components/RoadmapTimeline';
import styles from '@/app/[locale]/parcours/parcours.module.css';

/** Textes par défaut (traduits) fournis par la page serveur, repli des champs vides. */
export interface RoadmapCopyFallbacks {
  title: string;
  intro: string;
  kicker: string;
  heading: string;
  ctaTitle: string;
  ctaButton: string;
}

/**
 * Corps de la page « Parcours » : en-tête, section des étapes et bloc CTA.
 *
 * Les textes viennent de /admin/parcours (composant client, réaligné sur l'API) ;
 * chaque texte vide retombe sur son équivalent traduit (`fallbacks`). Les étapes
 * elles-mêmes sont rendues par RoadmapTimeline, qui se rafraîchit de son côté.
 *
 * Rendu côté serveur avec les snapshots bakés → le HTML servi contient déjà les
 * bons textes (SEO, visiteurs sans JS), puis useLiveObject se réaligne sur l'API.
 */
export default function RoadmapPageContent({
  initialCopy,
  fallbacks,
  crumbs,
  initialSteps,
}: {
  initialCopy: RoadmapPageCopy;
  fallbacks: RoadmapCopyFallbacks;
  crumbs: { home: string; roadmap: string };
  initialSteps: RoadmapStep[];
}) {
  const locale = useLocale() as Locale;
  const copy = useLiveObject(initialCopy, fetchRoadmapPage);

  // Valeur admin pour la locale courante, ou repli sur le texte traduit.
  const pick = (field: keyof RoadmapPageCopy, fallback: string) =>
    (copy[field][locale] || '').trim() || fallback;

  const title = pick('title', fallbacks.title);
  const intro = pick('intro', fallbacks.intro);
  const kicker = pick('kicker', fallbacks.kicker);
  const heading = pick('heading', fallbacks.heading);
  const ctaTitle = pick('ctaTitle', fallbacks.ctaTitle);
  const ctaButton = pick('ctaButton', fallbacks.ctaButton);

  return (
    <>
      <PageHeader
        title={title}
        intro={intro}
        crumbs={[{ label: crumbs.home, href: '/' }, { label: crumbs.roadmap }]}
      />

      <section className={`section ${styles.showcase}`}>
        <div className="wrap">
          <div className={styles.head}>
            <span className="kicker">{kicker}</span>
            <h2>{heading}</h2>
          </div>

          <RoadmapTimeline initialSteps={initialSteps} />
        </div>
      </section>

      <section className={styles.cta}>
        <div className={`wrap ${styles.ctaInner}`}>
          <h2>{ctaTitle}</h2>
          <Link href="/cours-essai-gratuit" className={`btn ${styles.ctaButton}`}>
            {ctaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
