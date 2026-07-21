import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Program } from '@/data/types';
import { pick } from '@/lib/localized';
import Photo from './Photo';
import styles from './ProgramCard.module.css';

export default async function ProgramCard({
  program,
  locale,
}: {
  program: Program;
  locale: Locale;
}) {
  const t = await getTranslations('common');

  return (
    <article className={styles.card}>
      <Link
        href={{ pathname: '/cours/[slug]', params: { slug: program.slug } }}
        aria-label={pick(program.name, locale)}
      >
        <div className={styles.media}>
          <Photo
            src={program.image}
            url={program.image?.startsWith('http') ? program.image : undefined}
            alt={pick(program.imageAlt, locale)}
            sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 33vw"
          />
        </div>
      </Link>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link href={{ pathname: '/cours/[slug]', params: { slug: program.slug } }}>
            {pick(program.name, locale)}
          </Link>
        </h3>
        <p className={styles.tagline}>{pick(program.tagline, locale)}</p>

        <div className={styles.meta}>
          <span className={styles.tag}>{pick(program.ageRange, locale)}</span>
          <span className={styles.tag}>{pick(program.level, locale)}</span>
          <span className={styles.tag}>{pick(program.duration, locale)}</span>
        </div>

        <Link
          href={{ pathname: '/cours/[slug]', params: { slug: program.slug } }}
          className={styles.link}
        >
          {t('learnMore')}
        </Link>
      </div>
    </article>
  );
}

export { styles as programCardStyles };
