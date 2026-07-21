import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale, StaticPathname } from '@/i18n/routing';
import { site } from '@/data/site';
import { pick } from '@/lib/localized';
import { getPublicSettings } from '@/lib/settings';
import { getPrograms } from '@/lib/programs';
import styles from './Footer.module.css';

type NavKey = 'home' | 'programs' | 'roadmap' | 'instructors' | 'schedule' | 'blog' | 'books' | 'contact';

/** `frOnly` items are hidden in English — the blog and books exist in FR only. */
const navItems: { href: StaticPathname; key: NavKey; frOnly?: boolean }[] = [
  { href: '/', key: 'home' },
  { href: '/cours', key: 'programs' },
  { href: '/parcours', key: 'roadmap' },
  { href: '/instructeurs', key: 'instructors' },
  { href: '/horaires', key: 'schedule' },
  { href: '/blog', key: 'blog', frOnly: true },
  { href: '/livres', key: 'books', frOnly: true },
  { href: '/contact', key: 'contact' },
];

export default async function Footer() {
  const t = await getTranslations('footer');
  const tn = await getTranslations('nav');
  const locale = (await getLocale()) as Locale;

  // Sections the client has hidden: drop their footer links too (the pages 404).
  const { hiddenNav } = await getPublicSettings();
  const hidden = hiddenNav as string[];
  const programsHidden = hidden.includes('programs');
  const programsByOrder = await getPrograms();

  const socials = [
    { href: site.social.instagram, label: 'Instagram' },
    { href: site.social.facebook, label: 'Facebook' },
    { href: site.social.youtube, label: 'YouTube' },
    { href: site.social.tiktok, label: 'TikTok' },
  ].filter((s) => s.href);

  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoMark}>詠</span>
              <span>{site.name}</span>
            </div>
            <p className={styles.tagline}>{t('tagline', { city: site.address.city })}</p>
            {socials.length > 0 && (
              <div className={styles.social}>
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                  >
                    {s.label.charAt(0)}
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-labelledby="footer-nav">
            <h2 id="footer-nav" className={styles.colTitle}>
              {t('navTitle')}
            </h2>
            <ul className={styles.list}>
              {navItems
                .filter((item) => !item.frOnly || locale === 'fr')
                .filter((item) => !hidden.includes(item.key))
                .map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{tn(item.key)}</Link>
                  </li>
                ))}
            </ul>
          </nav>

          {!programsHidden && (
            <nav aria-labelledby="footer-programs">
              <h2 id="footer-programs" className={styles.colTitle}>
                {t('programsTitle')}
              </h2>
              <ul className={styles.list}>
                {programsByOrder.map((p) => (
                  <li key={p.slug}>
                    <Link href={{ pathname: '/cours/[slug]', params: { slug: p.slug } }}>
                      {pick(p.name, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div>
            <h2 className={styles.colTitle}>{t('contactTitle')}</h2>
            <address className={styles.address}>
              {site.address.street}
              <br />
              {site.address.district}, {site.address.postalCode} {site.address.city}
              <br />
              {pick(site.address.countryName, locale)}
              <br />
              <br />
              <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
              <br />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </address>
          </div>
        </div>

        <div className={styles.bottom}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} {site.legalName}. {t('rights')}
          </p>
          <a href="#top">{t('backToTop')}</a>
        </div>
      </div>
    </footer>
  );
}
