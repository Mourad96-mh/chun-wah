'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import type { StaticPathname } from '@/i18n/routing';
import { site } from '@/data/site';
import type { NavKey } from '@/lib/nav';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './Header.module.css';

/** `frOnly` items are hidden in English — the blog and books exist in FR only. */
const navItems: { href: StaticPathname; key: NavKey; frOnly?: boolean }[] = [
  { href: '/cours', key: 'programs' },
  { href: '/parcours', key: 'roadmap' },
  { href: '/instructeurs', key: 'instructors' },
  { href: '/horaires', key: 'schedule' },
  { href: '/blog', key: 'blog', frOnly: true },
  { href: '/livres', key: 'books', frOnly: true },
  { href: '/contact', key: 'contact' },
];

export default function Header({ hiddenNav = [] }: { hiddenNav?: NavKey[] }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Two filters: `frOnly` hides FR-only links on the English site; `hiddenNav`
  // hides whatever the client has switched off from the admin (see lib/nav.ts).
  const visibleNav = navItems.filter(
    (item) => (!item.frOnly || locale === 'fr') && !hiddenNav.includes(item.key),
  );

  // Close the panel whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile panel is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isCurrent = (href: StaticPathname) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>詠</span>
          <span>{site.name}</span>
        </Link>

        <nav className={styles.nav} aria-label={t('home')}>
          <ul className={styles.navList}>
            {visibleNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.navLink}
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher className={styles.lang} />

          <button
            type="button"
            className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.burgerBar} />
            <span className={styles.burgerBar} />
            <span className={styles.burgerBar} />
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className={styles.mobilePanel}>
          <div className="wrap">
            <ul className={styles.mobileList}>
              <li>
                <Link
                  href="/"
                  className={styles.mobileLink}
                  aria-current={pathname === '/' ? 'page' : undefined}
                >
                  {t('home')}
                </Link>
              </li>
              {visibleNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.mobileLink}
                    aria-current={isCurrent(item.href) ? 'page' : undefined}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/cours-essai-gratuit" className="btn btn-primary btn-block">
              {t('trial')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
