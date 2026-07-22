import { defineRouting } from 'next-intl/routing';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'always',
  // ATTENTION — segments d'URL IDENTIQUES dans les deux langues.
  //
  // L'anglais avait ses propres segments (/programs, /schedule…). En SSR c'est
  // `src/middleware.ts` qui réécrivait ces URL localisées vers les routes
  // internes ; l'export statique n'a pas de middleware (il a été supprimé), donc
  // les fichiers sortaient dans /en/cours/ pendant que les liens pointaient vers
  // /en/programs/ → tout le site anglais renvoyait 404.
  //
  // On garde donc les mêmes segments partout : les liens correspondent aux
  // fichiers générés. Ne pas réintroduire de segments traduits sans repasser à
  // un rendu serveur.
  pathnames: {
    '/': '/',
    '/cours': {
      fr: '/cours',
      en: '/cours',
    },
    '/cours/[slug]': {
      fr: '/cours/[slug]',
      en: '/cours/[slug]',
    },
    '/parcours': {
      fr: '/parcours',
      en: '/parcours',
    },
    '/instructeurs': {
      fr: '/instructeurs',
      en: '/instructeurs',
    },
    '/horaires': {
      fr: '/horaires',
      en: '/horaires',
    },
    '/cours-essai-gratuit': {
      fr: '/cours-essai-gratuit',
      en: '/cours-essai-gratuit',
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
