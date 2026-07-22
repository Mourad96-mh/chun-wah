import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { getMediaMap } from '@/lib/media';
import PageHeader from '@/components/PageHeader';
import InstructorsList from '@/components/InstructorsList';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'instructors' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { name: site.name, city: site.address.city }),
    href: '/instructeurs',
    locale,
  });
}

export default async function InstructorsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('instructors');

  const t = await getTranslations('instructors');
  const tn = await getTranslations('nav');

  // Client-uploaded portraits keyed by 'instructor:<slug>'; blank = placeholder.
  const media = await getMediaMap();

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('instructors') }]}
      />

      <section className="section">
        <div className="wrap">
          <InstructorsList initialMedia={media} locale={locale} />
        </div>
      </section>
    </>
  );
}
