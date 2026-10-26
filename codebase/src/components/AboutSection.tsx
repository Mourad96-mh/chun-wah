'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { MediaMap } from '@/lib/media';
import { fetchHomePage, type HomePageCopy } from '@/lib/homePage';
import { useLiveObject } from '@/lib/useLiveObject';
import LivePhoto from './LivePhoto';
import styles from '@/app/[locale]/page.module.css';

/** Textes par défaut (traduits) fournis par la page serveur, repli des champs vides. */
export interface AboutFallbacks {
  kicker: string;
  title: string;
  body: string;
  learnMore: string;
  photoAlt: string;
}

/**
 * Section « à propos » de l'accueil : photo d'un côté, texte de l'autre.
 *
 * Les textes viennent de /admin/accueil (réalignés sur l'API après chargement) ;
 * chaque champ vide retombe sur sa traduction (`fallbacks`). La photo reste
 * pilotée par /admin/medias via LivePhoto (emplacement « academy »).
 *
 * Rendu côté serveur avec le snapshot baké → le HTML servi contient déjà les
 * bons textes (SEO, visiteurs sans JS), puis useLiveObject se réaligne sur l'API.
 */
export default function AboutSection({
  initialCopy,
  fallbacks,
  initialMedia,
  showTeamLink,
}: {
  initialCopy: HomePageCopy;
  fallbacks: AboutFallbacks;
  initialMedia: MediaMap;
  /** Le bouton suit la visibilité de la page Équipe dans les réglages du menu. */
  showTeamLink: boolean;
}) {
  const locale = useLocale() as Locale;
  const copy = useLiveObject(initialCopy, fetchHomePage);

  // Valeur admin pour la locale courante, ou repli sur le texte traduit.
  const pick = (field: keyof HomePageCopy, fallback: string) =>
    (copy[field][locale] || '').trim() || fallback;

  return (
    <section id="academie" className="section">
      <div className="wrap">
        <div className={styles.about}>
          <div className={styles.aboutMedia}>
            <LivePhoto
              slot="academy"
              initialMedia={initialMedia}
              src="/images/academy.jpg"
              fallbackAlt={fallbacks.photoAlt}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
          </div>
          <div className={styles.aboutBody}>
            <span className="kicker">{pick('aboutKicker', fallbacks.kicker)}</span>
            <h2>{pick('aboutTitle', fallbacks.title)}</h2>
            {/* Une ligne vide sépare deux paragraphes (texte par défaut comme admin). */}
            {pick('aboutBody', fallbacks.body)
              .split(/\n\s*\n/)
              .map((para, i) => (
                <p key={i}>{para.trim()}</p>
              ))}
            {showTeamLink && (
              <Link href="/equipe" className="btn btn-outline">
                {fallbacks.learnMore}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
