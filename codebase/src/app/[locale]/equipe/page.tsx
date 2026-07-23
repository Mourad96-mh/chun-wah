import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { getTeam } from '@/lib/team';
import { buildMetadata, absoluteUrl } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { breadcrumbSchema } from '@/lib/schema';
import PageHeader from '@/components/PageHeader';
import JsonLd from '@/components/JsonLd';
import TeamList from '@/components/TeamList';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'team' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { name: site.name, city: site.address.city }),
    href: '/equipe',
    locale,
  });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('team');

  const t = await getTranslations('team');
  const tn = await getTranslations('nav');

  // Membres bakés (repli sur le roster statique tant qu'aucun n'existe), réalignés
  // sur l'API côté client.
  const team = getTeam();

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('team') }]}
      />

      <section className="section">
        <div className="wrap">
          <TeamList initialTeam={team} />
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: tn('home'), url: absoluteUrl('/', locale) },
          { name: tn('team'), url: absoluteUrl('/equipe', locale) },
        ])}
      />
    </>
  );
}
