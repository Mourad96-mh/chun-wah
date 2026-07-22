'use client';

import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import type { Instructor } from '@/data/types';
import { instructors as staticInstructors } from '@/data/instructors';
import { fetchMediaMap, type MediaMap } from '@/lib/media';
import { pick, pickList } from '@/lib/localized';
import { useLiveObject } from '@/lib/useLiveObject';
import Photo from './Photo';
import styles from '@/app/[locale]/instructeurs/instructors.module.css';

/**
 * Roster des instructeurs. Photos ET noms viennent de la carte des médias
 * (/admin/medias, slots `instructor:<slug>`), réalignée sur l'API après
 * chargement : remplacer un portrait ou renommer un instructeur ne demande plus
 * de redéployer.
 */
export default function InstructorsList({
  initialMedia,
  locale,
}: {
  initialMedia: MediaMap;
  locale: Locale;
}) {
  const t = useTranslations('instructors');
  const media = useLiveObject(initialMedia, fetchMediaMap);

  // Le nom affiché peut être surchargé depuis l'admin (même règle que lib/instructors).
  const instructors: Instructor[] = staticInstructors.map((i) => {
    const name = media[`instructor:${i.slug}`]?.name?.trim();
    return name ? { ...i, name } : i;
  });

  return (
    <div className={styles.list}>
      {instructors.map((instructor) => (
        <article key={instructor.slug} className={styles.card}>
          <div className={styles.media}>
            <Photo
              src={instructor.image}
              url={media[`instructor:${instructor.slug}`]?.url}
              alt={
                media[`instructor:${instructor.slug}`]?.alt ||
                `${instructor.name} — ${pick(instructor.title, locale)}`
              }
              sizes="(max-width: 760px) 100vw, 300px"
            />
          </div>

          <div>
            <h2 className={styles.name}>{instructor.name}</h2>
            <span className={styles.role}>{pick(instructor.title, locale)}</span>
            <p className={styles.bio}>{pick(instructor.bio, locale)}</p>

            <h3 className={styles.credTitle}>{t('credentials')}</h3>
            <ul className={styles.creds}>
              {pickList(instructor.credentials, locale).map((cred) => (
                <li key={cred} className={styles.cred}>
                  {cred}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
