import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { getRoadmapSteps } from '@/lib/roadmap';
import { getRoadmapPage } from '@/lib/roadmapPage';
import { buildMetadata, absoluteUrl } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/components/JsonLd';
import RoadmapPageContent from '@/components/RoadmapPageContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'roadmap' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { name: site.name }),
    href: '/parcours',
    locale,
  });
}

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('roadmap');

  const t = await getTranslations('roadmap');
  const tn = await getTranslations('nav');

  // Étapes + textes de la page (gérés dans /admin/parcours) — snapshots bakés,
  // réalignés sur l'API côté client. Les textes vides retombent sur les valeurs
  // traduites par défaut, résolues ici et passées au composant client.
  const steps = getRoadmapSteps();
  const copy = getRoadmapPage();
  const fallbacks = {
    title: t('title'),
    intro: t('intro'),
    kicker: t('stagesKicker'),
    heading: t('stagesTitle'),
    ctaTitle: t('ctaTitle'),
    ctaButton: t('ctaButton'),
  };

  return (
    <>
      <RoadmapPageContent
        initialCopy={copy}
        fallbacks={fallbacks}
        crumbs={{ home: tn('home'), roadmap: tn('roadmap') }}
        initialSteps={steps}
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: tn('home'), url: absoluteUrl('/', locale) },
          { name: tn('roadmap'), url: absoluteUrl('/parcours', locale) },
        ])}
      />
    </>
  );
}
