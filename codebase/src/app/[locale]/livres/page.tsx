import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { books, type Book } from '@/lib/books';
import { assertNavVisible } from '@/lib/settings';
import PageHeader from '@/components/PageHeader';
import styles from './books.module.css';

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

  // Livres publiés depuis le snapshot baké au build (src/lib/books.data.json).
  // Regroupés par catégorie, dans l'ordre où ils arrivent (déjà trié par `order`).
  const groups = new Map<string, Book[]>();
  for (const book of books) {
    const key = book.category?.trim() || t('uncategorized');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(book);
  }

  return (
    <>
      <PageHeader
        title={t('title')}
        intro={t('intro')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('books') }]}
      />

      <section className="section">
        <div className="wrap">
          {books.length === 0 ? (
            <p className="lead">{t('empty')}</p>
          ) : (
            [...groups.entries()].map(([category, groupBooks]) => (
              <div key={category} className={styles.group}>
                <h2 className={styles.groupTitle}>{category}</h2>
                <div className={styles.list}>
                  {groupBooks.map((book) => (
                    <article key={book.id} className={styles.book}>
                      {book.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className={styles.cover}
                          src={book.coverImage}
                          alt={`Couverture de ${book.title}`}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.coverEmpty} aria-hidden="true">
                          書
                        </div>
                      )}

                      <div>
                        <h3 className={styles.title}>{book.title}</h3>
                        <span className={styles.author}>{book.author}</span>
                        <p className={styles.recommendation}>{book.recommendation}</p>
                        {book.level && <span className={styles.level}>{book.level}</span>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
