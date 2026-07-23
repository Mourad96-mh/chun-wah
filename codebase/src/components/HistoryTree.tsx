'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import { fetchMilestones, type Milestone } from '@/lib/history';
import { useLiveData } from '@/lib/useLiveData';
import Photo from './Photo';
import styles from './HistoryTree.module.css';

/**
 * Arbre chronologique vertical qui se déploie : chaque nœud d'année s'ouvre au
 * clic pour révéler le titre, la description et l'image du jalon. Réaligné sur
 * l'API après chargement (ajouter/modifier un jalon dans /admin/histoire apparaît
 * sans redéployer). Le premier jalon est ouvert par défaut.
 */
export default function HistoryTree({ initialMilestones }: { initialMilestones: Milestone[] }) {
  const locale = useLocale() as Locale;
  const items = useLiveData(initialMilestones, fetchMilestones);

  // Nœuds ouverts (par id). Le premier est ouvert au départ.
  const [open, setOpen] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (items.length) setOpen((o) => (Object.keys(o).length ? o : { [items[0].id]: true }));
  }, [items]);

  if (!items.length) return null;

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  return (
    <ol className={styles.tree}>
      {items.map((m) => {
        const isOpen = !!open[m.id];
        const title = m.title[locale].trim();
        const description = m.description[locale].trim();
        const panelId = `milestone-${m.id}`;

        return (
          <li key={m.id} className={styles.node}>
            <button
              type="button"
              className={styles.header}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(m.id)}
            >
              <span className={styles.dot} aria-hidden />
              <span className={styles.year}>{m.year}</span>
              {title && <span className={styles.headTitle}>{title}</span>}
              <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>

            <div
              id={panelId}
              className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
              hidden={!isOpen}
            >
              <div className={styles.panelInner}>
                {m.image && (
                  <div className={styles.media}>
                    <Photo
                      src={m.image}
                      url={m.image.startsWith('http') ? m.image : undefined}
                      alt={title || m.year}
                      sizes="(max-width: 760px) 100vw, 280px"
                    />
                  </div>
                )}
                {description && <p className={styles.text}>{description}</p>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
