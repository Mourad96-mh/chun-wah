'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { StaticPathname } from '@/i18n/routing';
import type { NavKey } from '@/lib/nav';
import { useHiddenNav } from '@/lib/useHiddenNav';
import styles from './Footer.module.css';

/**
 * Liste de liens du pied de page. Composant client uniquement pour suivre en
 * direct les liens masqués depuis /admin (même raison que le Header : en export
 * statique, le snapshot figerait le menu jusqu'au prochain déploiement).
 */
export default function FooterNav({
  items,
  initialHidden,
}: {
  // 'home' n'est pas masquable (absent de TOGGLEABLE_NAV) mais figure dans la liste.
  items: { href: StaticPathname; key: NavKey | 'home'; frOnly?: boolean }[];
  initialHidden: NavKey[];
}) {
  const tn = useTranslations('nav');
  const locale = useLocale();
  const hidden = useHiddenNav(initialHidden);

  return (
    <ul className={styles.list}>
      {items
        .filter((item) => !item.frOnly || locale === 'fr')
        .filter((item) => item.key === 'home' || !hidden.includes(item.key))
        .map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{tn(item.key)}</Link>
          </li>
        ))}
    </ul>
  );
}
