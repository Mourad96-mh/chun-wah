import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { Inter, Oswald } from 'next/font/google';
import { routing, locales, type Locale } from '@/i18n/routing';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { localBusinessSchema } from '@/lib/schema';
import { getPublicSettings } from '@/lib/settings';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import JsonLd from '@/components/JsonLd';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-oswald',
});

export const viewport: Viewport = {
  themeColor: '#0e0f11',
  // Thème sombre assumé : empêche le dark mode automatique des navigateurs
  // mobiles de réinverser les couleurs (cf. color-scheme dans globals.css).
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    metadataBase: new URL(site.url),
    ...buildMetadata({
      title: t('metaTitle', { city: site.address.city, name: site.name }),
      description: t('metaDescription', { city: site.address.city }),
      href: '/',
      locale,
    }),
    title: {
      default: t('metaTitle', { city: site.address.city, name: site.name }),
      template: `%s | ${site.name}`,
    },
    // Icônes servies depuis public/ (et non app/icon.*) : le loader de routes
    // metadata de Next bute sur les chemins contenant une espace, comme ici
    // « …/Bureau/CHUN WAH » — même raison que pour sitemap.xml et robots.txt.
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    // Propriété Google Search Console. Présente aussi dans public/index.html :
    // c'est ce fichier que Google reçoit sur la racine du domaine.
    verification: {
      google: 'niLZpp794Ddf4SHOOQu_whUY0QfevnWDp8fTpITsxHY',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enables static rendering for this locale.
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'nav' });

  // Which header links the client has hidden from the admin. Cached with the
  // layout and refreshed on save via revalidatePath('/', 'layout').
  const { hiddenNav } = await getPublicSettings();

  return (
    <html lang={locale} className={`${inter.variable} ${oswald.variable}`}>
      {/* suppressHydrationWarning: some browser extensions (e.g. ColorZilla adds
          cz-shortcut-listen) mutate <body> before hydration, which React flags
          as a mismatch. This suppresses that one attribute-level diff on <body>
          only — it does NOT hide mismatches inside the app's own components. */}
      <body id="top" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <a href="#main" className="skip-link">
            {t('skipToContent')}
          </a>
          <Header hiddenNav={hiddenNav} />
          <main id="main">{children}</main>
          <Footer />
          <FloatingWhatsApp />
        </NextIntlClientProvider>
        <JsonLd data={localBusinessSchema(locale as Locale)} />
      </body>
    </html>
  );
}
