import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { books } from '@/lib/books';
import { assertNavVisible } from '@/lib/settings';
import PageHeader from '@/components/PageHeader';
import BooksList from '@/components/BooksList';

// Livres en français uniquement : on ne génère que /fr/livres.
export function generateStaticParams() {
  return [{ locale: 'fr' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'books' });

  return buildMetadata({
    title: t('metaTitle', { name: site.name }),
    description: t('metaDescription', { name: site.name }),
    href: '/livres',
    locale,
  });
}

export default async function BooksPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await assertNavVisible('books');

  const t = await getTranslations('books');
  const tn = await getTranslations('nav');

  // Le HTML est baké depuis le snapshot (src/lib/books.data.json) pour le SEO ;
  // BooksList le réaligne ensuite sur l'API pour refléter l'admin sans déployer.
  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('books') }]}
      />

      <section className="section">
        <div className="wrap">
          <BooksList initialBooks={books} />
        </div>
      </section>
    </>
  );
}
