'use client';

import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/**
 * Switches locale while staying on the equivalent page.
 *
 * On dynamic routes usePathname() returns the *template* ("/cours/[slug]"),
 * so the route params have to be passed back in or the link would 404.
 * The cast is unavoidable: the params shape is only known at runtime.
 */
export default function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();

  const otherLocale: Locale = locale === 'fr' ? 'en' : 'fr';

  return (
    <Link
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      href={{ pathname, params } as any}
      locale={otherLocale}
      className={className}
      hrefLang={otherLocale}
    >
      {t('switchLanguage')}
    </Link>
  );
}
