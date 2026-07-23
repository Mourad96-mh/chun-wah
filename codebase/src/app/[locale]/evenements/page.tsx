import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { getEvents } from '@/lib/events';
import { buildMetadata, absoluteUrl } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { breadcrumbSchema } from '@/lib/schema';
import PageHeader from '@/components/PageHeader';
import JsonLd from '@/components/JsonLd';
import EventsList from '@/components/EventsList';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'events' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { name: site.name, city: site.address.city }),
    href: '/evenements',
    locale,
  });
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('events');

  const t = await getTranslations('events');
  const tn = await getTranslations('nav');

  // Événements bakés, réalignés sur l'API côté client.
  const events = getEvents();

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('events') }]}
      />

      <section className="section">
        <div className="wrap">
          <EventsList initialEvents={events} />
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: tn('home'), url: absoluteUrl('/', locale) },
          { name: tn('events'), url: absoluteUrl('/evenements', locale) },
        ])}
      />
    </>
  );
}
