import type { Locale } from '@/i18n/routing';
import { faq } from '@/data/faq';
import { pick } from '@/lib/localized';
import styles from './Faq.module.css';

/**
 * Uses native <details>/<summary>: no JavaScript, keyboard-accessible for free,
 * and the answers stay in the HTML so they are crawlable.
 */
export default function Faq({ locale }: { locale: Locale }) {
  return (
    <div className={styles.list}>
      {faq.map((item, i) => (
        <details key={i} className={styles.item} name="faq">
          <summary className={styles.summary}>{pick(item.question, locale)}</summary>
          <div className={styles.answer}>
            <p>{pick(item.answer, locale)}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
