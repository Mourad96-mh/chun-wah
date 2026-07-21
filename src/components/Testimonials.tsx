import type { Locale } from '@/i18n/routing';
import { testimonials } from '@/data/testimonials';
import { pick } from '@/lib/localized';
import styles from './Testimonials.module.css';

export default function Testimonials({ locale }: { locale: Locale }) {
  return (
    <div className={styles.grid}>
      {testimonials.map((item, i) => (
        <figure key={i} className={styles.card}>
          <div className={styles.stars} aria-label={`${item.rating}/5`}>
            <span aria-hidden="true">{'★'.repeat(item.rating)}</span>
          </div>
          <blockquote className={styles.quote}>
            <p style={{ margin: 0 }}>“{pick(item.quote, locale)}”</p>
          </blockquote>
          <figcaption className={styles.author}>
            {item.name}
            <span className={styles.role}>{pick(item.role, locale)}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
