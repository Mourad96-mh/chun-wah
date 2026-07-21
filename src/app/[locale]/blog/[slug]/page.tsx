import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { dbConnect } from '@/lib/db';
import { Article } from '@/models/Article';
import { absoluteUrl } from '@/lib/seo';
import { assertNavVisible } from '@/lib/settings';
import { renderMarkdown, readingTime } from '@/lib/markdown';
import { breadcrumbSchema } from '@/lib/schema';
import PageHeader from '@/components/PageHeader';
import JsonLd from '@/components/JsonLd';
import styles from '../blog.module.css';

export const revalidate = 300;

type Params = { locale: Locale; slug: string };

async function getArticle(slug: string) {
  await dbConnect();
  return Article.findOne({ slug, status: 'published' }).lean();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const url = absoluteUrl({ pathname: '/blog/[slug]', params: { slug } }, locale);

  return {
    title: article.title,
    description: article.excerpt,
    // No hreflang: the blog exists in French only.
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      url,
      siteName: site.name,
      publishedTime: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      images: article.coverImage
        ? [{ url: article.coverImage, alt: article.coverAlt || article.title }]
        : [{ url: `${site.url}/images/og-default.jpg` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;

  if (locale !== 'fr') redirect({ href: { pathname: '/blog/[slug]', params: { slug } }, locale: 'fr' });

  setRequestLocale(locale);
  await assertNavVisible('blog');

  const article = await getArticle(slug);
  if (!article) notFound();

  const t = await getTranslations('blog');
  const tn = await getTranslations('nav');

  const html = renderMarkdown(article.body);
  const published = article.publishedAt ? new Date(article.publishedAt) : null;
  const url = absoluteUrl({ pathname: '/blog/[slug]', params: { slug } }, locale);

  // A few other posts to keep readers on the site.
  const related = await Article.find({
    status: 'published',
    _id: { $ne: article._id },
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select('title slug excerpt')
    .lean();

  return (
    <>
      <PageHeader
        title={article.title}
        crumbs={[
          { label: tn('home'), href: '/' },
          { label: tn('blog'), href: '/blog' },
          { label: article.title },
        ]}
      />

      <article className="section">
        <div className="wrap-narrow">
          <div className={styles.articleMeta}>
            {published && (
              <time dateTime={published.toISOString()}>
                {t('publishedOn', { date: dateFmt.format(published) })}
              </time>
            )}
            {article.author && <span>{t('by', { author: article.author })}</span>}
            <span>·</span>
            <span>{t('readingTime', { minutes: readingTime(article.body) })}</span>
          </div>

          {article.coverImage && (
            <figure className={styles.cover}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.coverImage}
                src={article.coverImage}
                alt={article.coverAlt || ''}
              />
            </figure>
          )}

          {/* Sanitised in renderMarkdown() before it ever reaches here. */}
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />

          <div className={styles.articleFoot}>
            <Link href="/blog" className="btn btn-outline">
              {t('backToBlog')}
            </Link>
            <Link href="/cours-essai-gratuit" className="btn btn-primary">
              {t('ctaButton')}
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section section-alt">
          <div className="wrap">
            <h2>{t('relatedTitle')}</h2>
            <div className={styles.grid}>
              {related.map((r) => (
                <article key={String(r._id)} className={styles.card}>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>
                      <Link href={{ pathname: '/blog/[slug]', params: { slug: r.slug } }}>
                        {r.title}
                      </Link>
                    </h3>
                    <p className={styles.cardExcerpt}>{r.excerpt}</p>
                    <Link
                      href={{ pathname: '/blog/[slug]', params: { slug: r.slug } }}
                      className={styles.cardLink}
                    >
                      {t('readMore')}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: article.title,
          description: article.excerpt,
          url,
          mainEntityOfPage: url,
          inLanguage: 'fr',
          datePublished: published?.toISOString(),
          dateModified: article.updatedAt
            ? new Date(article.updatedAt).toISOString()
            : published?.toISOString(),
          image: article.coverImage || `${site.url}/images/og-default.jpg`,
          author: {
            '@type': article.author ? 'Person' : 'Organization',
            name: article.author || site.name,
          },
          publisher: {
            '@type': 'Organization',
            name: site.name,
            url: site.url,
          },
          keywords: article.tags?.join(', ') || undefined,
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: tn('home'), url: absoluteUrl('/', locale) },
          { name: tn('blog'), url: absoluteUrl('/blog', locale) },
          { name: article.title, url },
        ])}
      />
    </>
  );
}
