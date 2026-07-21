import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import { dbConnect } from '@/lib/db';
import { Settings } from '@/models/Settings';
import { isNavKey, type NavKey } from '@/lib/nav';

/** Cache tag tying the header's settings read to the admin save (revalidateTag). */
export const NAV_SETTINGS_TAG = 'nav-settings';

async function readHiddenNav(): Promise<NavKey[]> {
  await dbConnect();
  const doc = await Settings.findOne({ key: 'main' })
    .select('hiddenNav')
    .lean<{ hiddenNav?: string[] }>();
  // Only ever return a plain string[] here — the value is cached across requests,
  // so it must be serialisable (no ObjectId / Mongoose docs).
  return (doc?.hiddenNav ?? []).filter(isNavKey);
}

/**
 * Cached so the header doesn't hit the database on every page render. The cache
 * is busted by tag from the admin (see /api/admin/settings PUT → revalidateTag),
 * NOT by revalidatePath('/', 'layout') — a tag update leaves the Router Cache of
 * the page you're currently viewing intact, which path-based layout revalidation
 * does not, and that was making a hidden route momentarily 404 in the browser.
 */
const cachedHiddenNav = unstable_cache(readHiddenNav, ['nav-settings'], {
  tags: [NAV_SETTINGS_TAG],
});

/**
 * Public-facing settings read by the root layout to build the header.
 *
 * Never throws: an unreachable database must not take the whole site down, so it
 * degrades to "everything visible" (the safe default).
 */
export async function getPublicSettings(): Promise<{ hiddenNav: NavKey[] }> {
  try {
    return { hiddenNav: await cachedHiddenNav() };
  } catch (err) {
    console.error('[settings] unavailable, defaulting to all nav visible:', err);
    return { hiddenNav: [] };
  }
}

/**
 * Guard for a section's page(s): when the client has hidden this nav link, the
 * corresponding route becomes genuinely unavailable (renders the 404), not just
 * missing from the menu. Call it at the top of every page that belongs to a
 * toggleable section — both the list page and its dynamic children.
 *
 * Fail-open: if settings can't be read, the page stays reachable (getPublicSettings
 * already degrades to "everything visible"), so a DB hiccup never hides content.
 */
export async function assertNavVisible(key: NavKey): Promise<void> {
  const { hiddenNav } = await getPublicSettings();
  if (hiddenNav.includes(key)) notFound();
}
