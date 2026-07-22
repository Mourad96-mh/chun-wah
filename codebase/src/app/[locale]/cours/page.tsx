import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { getPrograms } from '@/lib/programs';
import { assertNavVisible } from '@/lib/settings';
import PageHeader from '@/components/PageHeader';
import ProgramsList from '@/components/ProgramsList';
import styles from '../page.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'programs' });

  return buildMetadata({
    title: t('metaTitle', { city: site.address.city, name: site.name }),
    description: t('metaDescription', { city: site.address.city }),
    href: '/cours',
    locale,
  });
}

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('programs');

  const t = await getTranslations('programs');
  const tn = await getTranslations('nav');

  const programsByOrder = await getPrograms();

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('programs') }]}
      />

      <section className="section">
        <div className="wrap">
          <ProgramsList
            initialPrograms={programsByOrder}
            locale={locale}
            className={styles.cardGrid}
          />
        </div>
      </section>
    </>
  );
}
