import { notFound } from 'next/navigation';
import rawSettings from '@/lib/settings.data.json';
import { isNavKey, type NavKey } from '@/lib/nav';

/**
 * Seam pour les réglages du menu. La donnée vient désormais du snapshot baké au
 * build (src/lib/settings.data.json, synchronisé depuis l'API Express par
 * scripts/sync-content.mjs) — plus de Mongo ni d'unstable_cache, compatible
 * export statique. L'API publique (getPublicSettings / assertNavVisible) est
 * INCHANGÉE : le layout racine et les pages à section basculable l'appellent tel
 * quel. Seule la source de données a changé.
 */

/** Conservé pour compat avec l'ancienne route Next encore présente (no-op). */
export const NAV_SETTINGS_TAG = 'nav-settings';

// Clés masquées, filtrées sur les clés reconnues (le snapshot est déjà propre,
// mais on filtre par sécurité sur n'importe quel payload).
const hiddenNav: NavKey[] = ((rawSettings as { hiddenNav?: string[] }).hiddenNav ?? []).filter(
  isNavKey,
);

/**
 * Réglages publics lus par le layout racine pour construire le header.
 * Défaut sûr : tout visible si le snapshot est vide.
 */
export async function getPublicSettings(): Promise<{ hiddenNav: NavKey[] }> {
  return { hiddenNav };
}

/**
 * Garde pour la/les page(s) d'une section : quand le client a masqué ce lien de
 * nav, la route correspondante devient réellement indisponible (rend le 404),
 * pas seulement absente du menu. À appeler en tête de chaque page appartenant à
 * une section basculable.
 */
export async function assertNavVisible(key: NavKey): Promise<void> {
  const { hiddenNav } = await getPublicSettings();
  if (hiddenNav.includes(key)) notFound();
}
