import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { programsByOrder } from '@/data/programs';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import TrialForm from '@/components/TrialForm';
import styles from './trial.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trial' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { city: site.address.city }),
    href: '/cours-essai-gratuit',
    locale,
  });
}

export default async function TrialPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('trial');
  const tn = await getTranslations('nav');
  const tc = await getTranslations('common');

  const steps = [t('step1'), t('step2'), t('step3')];

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('trial') }]}
      />

      <section className="section">
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <ol className={styles.steps}>
                {steps.map((step, i) => (
                  <li key={i} className={styles.step}>
                    <span className={styles.stepNumber} aria-hidden="true">
                      {i + 1}
                    </span>
                    <p className={styles.stepText}>{step}</p>
                  </li>
                ))}
              </ol>

              <div className={styles.contactBlock}>
                <h2 className={styles.contactTitle}>{tn('contact')}</h2>
                <div className={styles.contactLinks}>
                  <a href={`tel:${site.phoneHref}`} className="btn btn-outline">
                    {tc('callUs')}
                  </a>
                  <a
                    href={`https://wa.me/${site.whatsapp}`}
                    className="btn btn-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tc('whatsapp')}
                  </a>
                </div>
              </div>
            </div>

            <TrialForm programs={programsByOrder} locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
