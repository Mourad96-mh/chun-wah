import { defineRouting } from 'next-intl/routing';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/cours': {
      fr: '/cours',
      en: '/programs',
    },
    '/cours/[slug]': {
      fr: '/cours/[slug]',
      en: '/programs/[slug]',
    },
    '/parcours': {
      fr: '/parcours',
      en: '/roadmap',
    },
    '/instructeurs': {
      fr: '/instructeurs',
      en: '/instructors',
    },
    '/horaires': {
      fr: '/horaires',
      en: '/schedule',
    },
    '/cours-essai-gratuit': {
      fr: '/cours-essai-gratuit',
      en: '/free-trial-class',
    },
    '/contact': {
      fr: '/contact',
      en: '/contact',
    },
    // Blog and books are French-only content. The routes must still be declared
    // for both locales (next-intl requires it), but the EN pages redirect to FR
    // rather than serving thin duplicates — see the note in the README.
    '/blog': {
      fr: '/blog',
      en: '/blog',
    },
    '/blog/[slug]': {
      fr: '/blog/[slug]',
      en: '/blog/[slug]',
    },
    '/livres': {
      fr: '/livres',
      en: '/livres',
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;

/**
 * Routes with no dynamic segment — the only ones that can be passed to <Link>
 * as a bare string. Dynamic routes need `{ pathname, params }` instead.
 */
export type StaticPathname = Exclude<Pathnames, `${string}[${string}`>;
