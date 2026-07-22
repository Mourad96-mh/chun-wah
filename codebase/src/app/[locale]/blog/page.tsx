import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { articles } from '@/lib/articles';
import { assertNavVisible } from '@/lib/settings';
import PageHeader from '@/components/PageHeader';
import ArticlesList from '@/components/ArticlesList';

// Blog en français uniquement : on ne génère que /fr/blog (pas de /en/blog).
// Remplace l'ancien redirect() runtime, impossible en export statique.
export function generateStaticParams() {
  return [{ locale: 'fr' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { name: site.name, city: site.address.city }),
    href: '/blog',
    locale,
  });
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('blog');

  const t = await getTranslations('blog');
  const tn = await getTranslations('nav');

  // Les articles viennent du snapshot baké au build (src/lib/articles.data.json,
  // synchronisé depuis l'API par scripts/sync-content.mjs). Snapshot vide → état
  // vide propre ; le build ne dépend jamais d'une base de données joignable.
  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('blog') }]}
      />

      <section className="section">
        <div className="wrap">
          <ArticlesList initialArticles={articles} />
        </div>
      </section>
    </>
  );
}
