// Clés de nav basculables depuis l'admin (réglages du menu). Doit rester aligné
// avec src/lib/nav.ts côté frontend (mêmes clés).
export const NAV_KEYS = [
  'programs',
  'roadmap',
  'instructors',
  'schedule',
  'blog',
  'books',
  'contact',
];

/** Vrai quand `value` est une clé de nav reconnue. */
export function isNavKey(value) {
  return typeof value === 'string' && NAV_KEYS.includes(value);
}
