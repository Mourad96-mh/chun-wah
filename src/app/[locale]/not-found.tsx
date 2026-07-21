import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <section className="section" style={{ textAlign: 'center' }}>
      <div className="wrap-narrow">
        <p className="kicker">404</p>
        <h1>{t('title')}</h1>
        <p className="lead" style={{ margin: '0 auto 2rem' }}>
          {t('body')}
        </p>
        <Link href="/" className="btn btn-primary">
          {t('cta')}
        </Link>
      </div>
    </section>
  );
}
