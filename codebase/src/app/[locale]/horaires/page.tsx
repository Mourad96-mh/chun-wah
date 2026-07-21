import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { getPrograms } from '@/lib/programs';
import { getInstructors } from '@/lib/instructors';
import { schedule, validateSchedule } from '@/data/schedule';
import { buildMetadata } from '@/lib/seo';
import { assertNavVisible, getPublicSettings } from '@/lib/settings';
import PageHeader from '@/components/PageHeader';
import ScheduleTable from '@/components/ScheduleTable';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'schedule' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { city: site.address.city }),
    href: '/horaires',
    locale,
  });
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('schedule');

  validateSchedule();

  // If /cours is hidden, the timetable must not link class names to 404 pages.
  const { hiddenNav } = await getPublicSettings();
  const programsHidden = (hiddenNav as string[]).includes('programs');

  // Instructor names may be overridden from the admin.
  const instructors = await getInstructors();
  const programsByOrder = await getPrograms();

  const t = await getTranslations('schedule');
  const tn = await getTranslations('nav');
  const th = await getTranslations('home');

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('schedule') }]}
      />

      <section className="section">
        <div className="wrap">
          <ScheduleTable
            slots={schedule}
            programs={programsByOrder}
            instructors={instructors}
            locale={locale}
            linkPrograms={!programsHidden}
          />
        </div>
      </section>

      <section className="section section-dark">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2>{th('ctaTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 2rem' }}>
            {th('ctaBody')}
          </p>
          <Link href="/cours-essai-gratuit" className="btn btn-primary">
            {th('ctaButton')}
          </Link>
        </div>
      </section>
    </>
  );
}
