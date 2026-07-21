import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { dbConnect } from '@/lib/db';
import { Article } from '@/models/Article';
import { buildMetadata } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { readingTime } from '@/lib/markdown';
import PageHeader from '@/components/PageHeader';
import styles from './blog.module.css';

// Content comes from MongoDB, so these pages are ISR rather than fully static.
export const revalidate = 300;

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

async function fetchArticles() {
  await dbConnect();
  return Article.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .select('title slug excerpt coverImage coverAlt tags publishedAt body')
    .lean();
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  // Blog is French-only: send EN visitors to the French version rather than
  // serving an empty English page.
  if (locale !== 'fr') redirect({ href: '/blog', locale: 'fr' });

  setRequestLocale(locale);
  await assertNavVisible('blog');

  const t = await getTranslations('blog');
  const tn = await getTranslations('nav');

  // A missing/unreachable database must not break the build or take the whole
  // vitrine down — the page degrades to its empty state and ISR retries later.
  let articles: Awaited<ReturnType<typeof fetchArticles>> = [];
  try {
    articles = await fetchArticles();
  } catch (err) {
    console.error('[blog] articles unavailable:', err);
  }

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
                <article key={String(article._id)} className={styles.card}>
                  {article.coverImage && (
                    <Link
                      href={{ pathname: '/blog/[slug]', params: { slug: article.slug } }}
                      className={styles.cardMedia}
                    >
                      {/* Covers come from Cloudinary at arbitrary sizes; a plain
                          img avoids whitelisting remote hosts in next.config. */}
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
                      <span>{t('readingTime', { minutes: readingTime(article.body) })}</span>
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
