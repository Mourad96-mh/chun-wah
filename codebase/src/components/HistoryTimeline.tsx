import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { milestones } from '@/lib/history';
import HistoryTree from './HistoryTree';
import styles from './HistoryTree.module.css';

/**
 * Section « Notre histoire » de la page d'accueil : la frise chronologique
 * interactive (arbre vertical qui se déploie), gérée depuis /admin/histoire.
 *
 * La liste vient du snapshot baké (src/lib/history.data.json). Comme
 * VideoShowcase, la section ne rend RIEN tant qu'aucun jalon n'existe — elle
 * n'apparaît qu'une fois que le client en a ajouté.
 */
export default async function HistoryTimeline({ locale }: { locale: Locale }) {
  if (milestones.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <section className="section section-alt">
      <div className="wrap">
        <div className={styles.head}>
          <span className="kicker">{t('historyKicker')}</span>
          <h2>{t('historyTitle')}</h2>
        </div>

        <HistoryTree initialMilestones={milestones} />
      </div>
    </section>
  );
}
