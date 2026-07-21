/**
 * Single source of truth for the header nav links the client is allowed to
 * show/hide from the admin. The `key` values match the `key` of each item in
 * components/Header.tsx `navItems` (and the `nav` translation namespace).
 *
 * Add a row here to make another link toggleable — the admin UI, the API
 * validation and the header filter all read from this list.
 */
export const TOGGLEABLE_NAV = [
  { key: 'programs', label: 'Cours' },
  { key: 'roadmap', label: 'Parcours' },
  { key: 'instructors', label: 'Instructeurs' },
  { key: 'schedule', label: 'Horaires' },
  { key: 'blog', label: 'Blog' },
  { key: 'books', label: 'Livres' },
  { key: 'contact', label: 'Contact' },
] as const;

export type NavKey = (typeof TOGGLEABLE_NAV)[number]['key'];

export const NAV_KEYS: NavKey[] = TOGGLEABLE_NAV.map((n) => n.key);

/** True when `value` is a nav key we recognise — narrows unknown input. */
export function isNavKey(value: unknown): value is NavKey {
  return typeof value === 'string' && (NAV_KEYS as string[]).includes(value);
}
