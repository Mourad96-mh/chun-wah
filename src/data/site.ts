/**
 * Central site configuration.
 *
 * PLACEHOLDER — every value marked TODO must be replaced with the real
 * client data before launch. Nothing else in the codebase hardcodes these.
 */

export const site = {
  // TODO: confirm exact legal / commercial name with the client.
  name: 'Chun Wah',
  legalName: 'Académie Chun Wah',

  // TODO: buy / confirm the domain. Used for canonicals, sitemap, OG tags.
  url: 'https://www.chunwah.ma',

  // TODO: real contact details.
  phone: '+212 6 00 00 00 00',
  phoneHref: '+212600000000',
  whatsapp: '212600000000',
  email: 'contact@chunwah.ma',

  address: {
    // TODO: real street address — this drives the whole local SEO setup.
    street: '00 Avenue Placeholder',
    district: 'Agdal',
    city: 'Rabat',
    postalCode: '10000',
    country: 'MA',
    countryName: { fr: 'Maroc', en: 'Morocco' },
    // TODO: real coordinates from Google Maps (right-click → copy coords).
    lat: 34.0132,
    lng: -6.8326,
    // TODO: paste the share URL of the Google Business Profile.
    mapsUrl: 'https://maps.google.com/?q=Chun+Wah+Rabat',
  },

  social: {
    // TODO: real handles. Remove any the club does not have.
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    youtube: '',
    tiktok: '',
  },

  // Displayed on the contact page and used in the LocalBusiness JSON-LD.
  openingHours: [
    {
      days: { fr: 'Lundi – Vendredi', en: 'Monday – Friday' },
      hours: { fr: '09:00 – 22:00', en: '09:00 – 22:00' },
    },
    {
      days: { fr: 'Samedi', en: 'Saturday' },
      hours: { fr: '09:00 – 18:00', en: '09:00 – 18:00' },
    },
    {
      days: { fr: 'Dimanche', en: 'Sunday' },
      hours: { fr: 'Fermé', en: 'Closed' },
    },
  ],

  // TODO: year the academy opened — used in the About section.
  foundedYear: 2015,
} as const;

export type Site = typeof site;
