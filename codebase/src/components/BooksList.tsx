'use client';

import { useTranslations } from 'next-intl';
import { fetchBooks, type Book } from '@/lib/books';
import { useLiveData } from '@/lib/useLiveData';
import styles from '@/app/[locale]/livres/books.module.css';

/**
 * Liste des livres, regroupés par catégorie. Composant client pour suivre en
 * direct les modifications faites dans /admin (voir useLiveData) : sans ça, une
 * couverture remplacée n'apparaîtrait qu'après un nouveau déploiement.
 */
export default function BooksList({ initialBooks }: { initialBooks: Book[] }) {
  const t = useTranslations('books');
  const books = useLiveData(initialBooks, fetchBooks);

  if (books.length === 0) return <p className="lead">{t('empty')}</p>;

  const groups = new Map<string, Book[]>();
  for (const book of books) {
    const key = book.category?.trim() || t('uncategorized');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(book);
  }

  return (
    <>
      {[...groups.entries()].map(([category, groupBooks]) => (
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
      ))}
    </>
  );
}
