import type { Locale } from '@/i18n/routing';
import type { Localized, LocalizedList } from '@/data/types';

/** Read a localized field for the active locale. */
export function pick(field: Localized, locale: Locale): string {
  return field[locale];
}

/** Read a localized list for the active locale. */
export function pickList(field: LocalizedList, locale: Locale): string[] {
  return field[locale];
}
