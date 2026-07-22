'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fetchArticles, type ArticleCard } from '@/lib/articles';
import { readingTime } from '@/lib/markdown';
import { useLiveData } from '@/lib/useLiveData';
import styles from '@/app/[locale]/blog/blog.module.css';

// Fixé en fr-FR : le blog est francophone uniquement. Le même formateur est
// utilisé au build et au runtime, donc pas d'écart d'hydratation.
const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * Grille des articles, réalignée sur l'API après chargement (voir useLiveData) :
 * un article publié ou modifié dans /admin apparaît sans redéployer.
 */
export default function ArticlesList({ initialArticles }: { initialArticles: ArticleCard[] }) {
  const t = useTranslations('blog');
  const articles = useLiveData(initialArticles, fetchArticles);

  if (articles.length === 0) return <p className="lead">{t('empty')}</p>;

  return (
    <div className={styles.grid}>
      {articles.map((article) => (
        <article key={article.id} className={styles.card}>
          {article.coverImage && (
            <Link
              href={{ pathname: '/blog/[slug]', params: { slug: article.slug } }}
              className={styles.cardMedia}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.cardImage}
                src={article.coverImage}
                alt={article.coverAlt || ''}
                loading="lazy"
              />
            </Link>
          )}

          <div className={styles.cardBody}>
            <div className={styles.cardMeta}>
              {article.publishedAt && (
                <time dateTime={new Date(article.publishedAt).toISOString()}>
                  {dateFmt.format(new Date(article.publishedAt))}
                </time>
              )}
              <span>·</span>
              <span>{t('readingTime', { minutes: readingTime(article.body ?? '') })}</span>
            </div>

            <h2 className={styles.cardTitle}>
              <Link href={{ pathname: '/blog/[slug]', params: { slug: article.slug } }}>
                {article.title}
              </Link>
            </h2>

            <p className={styles.cardExcerpt}>{article.excerpt}</p>

            <Link
              href={{ pathname: '/blog/[slug]', params: { slug: article.slug } }}
              className={styles.cardLink}
            >
              {t('readMore')}
            </Link>

            {article.tags && article.tags.length > 0 && (
              <div className={styles.tags}>
                {article.tags.map((tag: string) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
