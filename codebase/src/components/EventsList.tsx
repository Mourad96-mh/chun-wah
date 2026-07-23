'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import { fetchEvents, type EventItem } from '@/lib/events';
import { useLiveData } from '@/lib/useLiveData';
import Photo from './Photo';
import styles from '@/app/[locale]/evenements/events.module.css';

/** Parse une date 'YYYY-MM-DD' en composants localisés (badge + texte complet). */
function parseDate(dateStr: string, locale: string) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: d.toLocaleDateString(locale, { day: '2-digit' }),
    month: d.toLocaleDateString(locale, { month: 'short' }).replace('.', ''),
    full: d.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}

/**
 * Liste des événements (carte datée : badge date, image, titre, heure/lieu,
 * description), réalignée sur l'API après chargement : ajouter ou modifier un
 * événement dans /admin/evenements apparaît sans redéployer le site statique.
 */
export default function EventsList({ initialEvents }: { initialEvents: EventItem[] }) {
  const t = useTranslations('events');
  const locale = useLocale() as Locale;
  const events = useLiveData(initialEvents, fetchEvents);

  if (!events.length) {
    return (
      <p className="lead" style={{ textAlign: 'center' }}>
        {t('empty')}
      </p>
    );
  }

  return (
    <div className={styles.list}>
      {events.map((event) => {
        const title = event.title[locale].trim();
        const description = event.description[locale].trim();
        const start = parseDate(event.date, locale);
        const end = parseDate(event.endDate, locale);
        const dateText = end && event.endDate !== event.date ? `${start?.full} → ${end.full}` : start?.full;

        const meta = [event.time, event.location].filter(Boolean).join(' · ');

        return (
          <article key={event.id} className={styles.card}>
            <div className={styles.media}>
              <Photo
                src={event.image || '/images/hero.jpg'}
                url={event.image || undefined}
                alt={title}
                sizes="(max-width: 760px) 100vw, 340px"
              />
              {start && (
                <div className={styles.badge} aria-hidden>
                  <span className={styles.badgeDay}>{start.day}</span>
                  <span className={styles.badgeMonth}>{start.month}</span>
                </div>
              )}
            </div>

            <div className={styles.body}>
              {dateText && <span className={styles.date}>{dateText}</span>}
              {title && <h2 className={styles.title}>{title}</h2>}
              {meta && <p className={styles.meta}>{meta}</p>}
              {description && <p className={styles.text}>{description}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}
