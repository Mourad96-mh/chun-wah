import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { readingTime } from '@/lib/markdown';
import { articles } from '@/lib/articles';
import { assertNavVisible } from '@/lib/settings';
import PageHeader from '@/components/PageHeader';
import styles from './blog.module.css';

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

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

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
          {articles.length === 0 ? (
            <p className="lead">{t('empty')}</p>
          ) : (
            <div className={styles.grid}>
              {articles.map((article) => (
                <article key={article.id} className={styles.card}>
                  {article.coverImage && (
                    <Link
                      href={{ pathname: '/blog/[slug]', params: { slug: article.slug } }}
                      className={styles.cardMedia}
                    >
                      {/* Couvertures Cloudinary de tailles variées ; un <img> simple
                          évite d'avoir un optimiseur (absent en export statique). */}
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
          )}
        </div>
      </section>
    </>
  );
}
