import type { Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { programs } from '@/data/programs';
import { faq } from '@/data/faq';
import type { Program } from '@/data/types';
import { absoluteUrl } from './seo';
import { pick } from './localized';

/**
 * schema.org JSON-LD builders.
 *
 * NOTE: none of this can be trusted until the placeholder data in site.ts is
 * replaced — Google will happily index a fake address. Check every field with
 * the Rich Results Test before launch.
 */

const businessId = `${site.url}/#academy`;

export function localBusinessSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': businessId,
    name: site.name,
    legalName: site.legalName,
    url: absoluteUrl('/', locale),
    telephone: site.phone,
    email: site.email,
    foundingDate: String(site.foundedYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.address.lat,
      longitude: site.address.lng,
    },
    hasMap: site.address.mapsUrl,
    image: `${site.url}/images/og-default.jpg`,
    sameAs: Object.values(site.social).filter(Boolean),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    makesOffer: programs.map((p) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: pick(p.name, locale),
        description: pick(p.tagline, locale),
        url: absoluteUrl({ pathname: '/cours/[slug]', params: { slug: p.slug } }, locale),
      },
    })),
  };
}

export function programSchema(program: Program, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: pick(program.name, locale),
    description: pick(program.intro, locale),
    url: absoluteUrl({ pathname: '/cours/[slug]', params: { slug: program.slug } }, locale),
    provider: {
      '@type': 'SportsActivityLocation',
      '@id': businessId,
      name: site.name,
    },
    // Required by Google for Course rich results.
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'onsite',
      courseWorkload: pick(program.duration, locale),
      location: {
        '@type': 'Place',
        name: site.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.address.street,
          addressLocality: site.address.city,
          postalCode: site.address.postalCode,
          addressCountry: site.address.country,
        },
      },
    },
  };
}

export function faqSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: pick(item.question, locale),
      acceptedAnswer: {
        '@type': 'Answer',
        text: pick(item.answer, locale),
      },
    })),
  };
}

/**
 * VideoObject entries for the home-page showcase. Google requires name,
 * description, thumbnailUrl and uploadDate — a video without a poster has no
 * valid thumbnail, so it is skipped rather than emitting an invalid object.
 */
export function videoObjectsSchema(
  videos: {
    title: string;
    description?: string;
    videoUrl: string;
    poster?: string;
    createdAt?: Date;
  }[],
) {
  const abs = (u: string) => (/^https?:\/\//.test(u) ? u : `${site.url}${u.startsWith('/') ? '' : '/'}${u}`);

  return videos
    .filter((v) => v.poster)
    .map((v) => ({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: v.title,
      description: v.description?.trim() || v.title,
      thumbnailUrl: abs(v.poster as string),
      contentUrl: abs(v.videoUrl),
      uploadDate: (v.createdAt ?? new Date()).toISOString(),
    }));
}

export function breadcrumbSchema(
  crumbs: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
