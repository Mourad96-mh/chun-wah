'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Banner } from '@/lib/banners';
import { fetchBanners } from '@/lib/banners';
import { useLiveData } from '@/lib/useLiveData';
import type { MediaMap } from '@/lib/media';
import LivePhoto from '@/components/LivePhoto';
import styles from './Hero.module.css';

const AUTOPLAY_MS = 6000;

/**
 * Hero de la page d'accueil.
 *
 * Avec des diapositives (gérées dans /admin/bannieres) : diaporama d'images en
 * fondu-enchaîné, flèches quand il y en a plusieurs, défilement auto. Le titre
 * et la description de la diapositive active (bilingues) se superposent.
 *
 * Sans diapositive : retombe sur l'ancien hero — image unique pilotée depuis
 * /admin/medias (slot « hero ») + textes traduits du site.
 *
 * Dans les deux cas, l'accroche (kicker) et les boutons Essai gratuit / Horaires
 * restent fixes et traduits — ils ne dépendent pas de la diapositive.
 *
 * Le composant est rendu côté serveur avec `initialBanners` (snapshot baké) :
 * le HTML servi contient déjà la première diapositive (SEO, visiteurs sans JS),
 * puis useLiveData se réaligne sur l'API pour refléter l'admin sans redéployer.
 */
export default function Hero({
  initialBanners,
  locale,
  media,
  kicker,
  fallbackTitle,
  fallbackSubtitle,
  fallbackAlt,
  primaryCtaLabel,
  secondaryCtaLabel,
}: {
  initialBanners: Banner[];
  locale: Locale;
  media: MediaMap;
  kicker: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackAlt: string;
  primaryCtaLabel: string;
  /** Libellé du bouton Horaires, ou null si la section est masquée. */
  secondaryCtaLabel: string | null;
}) {
  const banners = useLiveData(initialBanners, fetchBanners);
  const count = banners.length;
  const hasSlides = count > 0;

  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Repartir de la première diapositive si la liste change (rafraîchissement live).
  useEffect(() => {
    setActive(0);
  }, [count]);

  const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);
  const prev = useCallback(() => setActive((a) => (a - 1 + count) % count), [count]);

  useEffect(() => {
    if (count <= 1 || reducedMotion) return;
    const id = setInterval(() => setActive((a) => (a + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, reducedMotion]);

  const current = hasSlides ? banners[Math.min(active, count - 1)] : null;
  // Un titre/description de diapositive vide retombe sur le texte traduit du site
  // (garantit un <h1> non vide même pour une diapositive « image seule »).
  const title = (current?.title[locale] || '').trim() || fallbackTitle;
  const subtitle = (current?.subtitle[locale] || '').trim() || fallbackSubtitle;

  return (
    <section className={styles.hero}>
      <div className={styles.heroMedia}>
        {hasSlides ? (
          banners.map((b, i) => (
            <picture key={b.id}>
              {b.imageMobile && (
                <source media="(max-width: 640px)" srcSet={b.imageMobile} />
              )}
              {/* Le texte est en HTML par-dessus → image décorative (alt vide). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.image}
                alt=""
                aria-hidden
                draggable={false}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : undefined}
                className={`${styles.slide} ${i === active ? styles.slideActive : ''}`}
              />
            </picture>
          ))
        ) : (
          <LivePhoto
            slot="hero"
            initialMedia={media}
            src="/images/hero.jpg"
            fallbackAlt={fallbackAlt}
            priority
            sizes="100vw"
          />
        )}
      </div>

      <div className={styles.heroOverlay} />

      <div className={`wrap ${styles.heroInner}`}>
        <div className={styles.heroContent}>
          <span className="kicker">{kicker}</span>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroSubtitle}>{subtitle}</p>
          <div className={styles.heroActions}>
            <Link href="/cours-essai-gratuit" className="btn btn-primary">
              {primaryCtaLabel}
            </Link>
            {secondaryCtaLabel && (
              <Link href="/horaires" className="btn btn-outline">
                {secondaryCtaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      {hasSlides && count > 1 && (
        <>
          <button
            type="button"
            aria-label={locale === 'fr' ? 'Image précédente' : 'Previous image'}
            onClick={prev}
            className={`${styles.arrow} ${styles.arrowPrev}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={locale === 'fr' ? 'Image suivante' : 'Next image'}
            onClick={next}
            className={`${styles.arrow} ${styles.arrowNext}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className={styles.dots} aria-hidden>
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`${locale === 'fr' ? 'Aller à l’image' : 'Go to image'} ${i + 1}`}
                onClick={() => setActive(i)}
                className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
