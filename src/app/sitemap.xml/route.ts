import { locales, type Locale } from '@/i18n/routing';
import { getPrograms } from '@/lib/programs';
import { absoluteUrl } from '@/lib/seo';
import { dbConnect } from '@/lib/db';
import { Article } from '@/models/Article';
import { getPublicSettings } from '@/lib/settings';
import type { NavKey } from '@/lib/nav';

/**
 * Written as a Route Handler rather than app/sitemap.ts on purpose: Next's
 * metadata-route loader chokes on project paths containing spaces/apostrophes,
 * and this project lives under "…/Bureau/CHUN WAH".
 */

// Picks up newly published articles without a redeploy.
export const revalidate = 3600;

type Href = Parameters<typeof absoluteUrl>[0];

interface Entry {
  href: Href;
  priority: number;
  /** French-only pages get no hreflang alternates and no EN URL. */
  frOnly?: boolean;
  lastmod?: string;
  /** When set and the client has hidden this section, the entry is dropped. */
  navKey?: NavKey;
}

function urlBlock(entry: Entry, lastmod: string): string[] {
  const entryLocales: Locale[] = entry.frOnly ? ['fr'] : [...locales];

  return entryLocales.map((locale) => {
    const alternates = entry.frOnly
      ? ''
      : `\n${locales
          .map(
            (alt) =>
              `    <xhtml:link rel="alternate" hreflang="${alt}" href="${absoluteUrl(entry.href, alt)}"/>`,
          )
          .join('\n')}`;

    return `  <url>
    <loc>${absoluteUrl(entry.href, locale)}</loc>
    <lastmod>${entry.lastmod ?? lastmod}</lastmod>
    <priority>${entry.priority.toFixed(1)}</priority>${alternates}
  </url>`;
  });
}

export async function GET() {
  const lastmod = new Date().toISOString().split('T')[0];

  const programs = await getPrograms();

  const entries: Entry[] = [
    { href: '/', priority: 1.0 },
    { href: '/cours', priority: 0.9, navKey: 'programs' },
    { href: '/parcours', priority: 0.8, navKey: 'roadmap' },
    { href: '/cours-essai-gratuit', priority: 0.9 },
    { href: '/horaires', priority: 0.8, navKey: 'schedule' },
    { href: '/instructeurs', priority: 0.7, navKey: 'instructors' },
    { href: '/contact', priority: 0.7, navKey: 'contact' },
    ...programs.map((p) => ({
      href: { pathname: '/cours/[slug]' as const, params: { slug: p.slug } },
      priority: 0.8,
      navKey: 'programs' as const,
    })),
    { href: '/blog', priority: 0.8, frOnly: true, navKey: 'blog' },
    { href: '/livres', priority: 0.6, frOnly: true, navKey: 'books' },
  ];

  // Published articles. A database hiccup must not take the sitemap down, so
  // the static entries are still served if this fails.
  try {
    await dbConnect();
    const articles = await Article.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .select('slug updatedAt publishedAt')
      .lean();

    for (const article of articles) {
      const date = article.updatedAt ?? article.publishedAt;
      entries.push({
        href: { pathname: '/blog/[slug]' as const, params: { slug: article.slug } },
        priority: 0.7,
        frOnly: true,
        navKey: 'blog',
        lastmod: date ? new Date(date).toISOString().split('T')[0] : lastmod,
      });
    }
  } catch (err) {
    console.error('[sitemap] articles unavailable:', err);
  }

  // Drop sections the client has hidden — their pages now 404, so they must not
  // be advertised in the sitemap.
  const { hiddenNav } = await getPublicSettings();
  const visibleEntries = entries.filter(
    (entry) => !entry.navKey || !hiddenNav.includes(entry.navKey),
  );

  const urls = visibleEntries.flatMap((entry) => urlBlock(entry, lastmod)).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
