import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing, locales, type Locale } from '@/i18n/routing';
import { site } from '@/data/site';

type Href = Parameters<typeof getPathname>[0]['href'];

/**
 * Absolute URL for a route in a given locale.
 *
 * Toujours terminée par « / » : le site est buildé avec `trailingSlash: true`,
 * donc /fr/ est l'URL réelle et /fr ne fait que rediriger. Sans ça, le sitemap
 * et les JSON-LD annonçaient /fr là où la canonical dit /fr/.
 */
export function absoluteUrl(href: Href, locale: Locale): string {
  const path = getPathname({ href, locale });
  return `${site.url}${path.endsWith('/') ? path : `${path}/`}`;
}

/**
 * Builds canonical + hreflang alternates + Open Graph for a page.
 * Every page should go through this so the alternates never drift.
 */
export function buildMetadata({
  title,
  description,
  href,
  locale,
  image = '/images/og-default.jpg',
}: {
  title: string;
  description: string;
  href: Href;
  locale: Locale;
  image?: string;
}): Metadata {
  const canonical = absoluteUrl(href, locale);

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = absoluteUrl(href, l);
  }
  languages['x-default'] = absoluteUrl(href, routing.defaultLocale);

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title,
      description,
      url: canonical,
      locale: locale === 'fr' ? 'fr_MA' : 'en_US',
      images: [{ url: `${site.url}${image}`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${site.url}${image}`],
    },
  };
}
