import { Link } from '@/i18n/navigation';
import type { StaticPathname } from '@/i18n/routing';
import styles from './PageHeader.module.css';

export interface Crumb {
  label: string;
  href?: StaticPathname;
}

export default function PageHeader({
  title,
  intro,
  crumbs,
}: {
  title: string;
  intro?: string;
  crumbs?: Crumb[];
}) {
  return (
    <header className={styles.header}>
      <div className="wrap">
        <div className={styles.inner}>
          {crumbs && crumbs.length > 0 && (
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              {crumbs.map((c, i) => (
                <span key={i}>
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                  {i < crumbs.length - 1 && <span aria-hidden="true"> / </span>}
                </span>
              ))}
            </nav>
          )}
          <h1 className={styles.title}>{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
        </div>
      </div>
    </header>
  );
}
