import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Settings } from '@/models/Settings';
import { requireSession } from '@/lib/auth';
import { isNavKey } from '@/lib/nav';
import { NAV_SETTINGS_TAG } from '@/lib/settings';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireSession();
    await dbConnect();

    const settings = await Settings.findOne({ key: 'main' }).lean();
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/settings GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireSession();
    await dbConnect();

    const body = await request.json();
    const raw = Array.isArray(body.hiddenNav) ? body.hiddenNav : [];
    // Never trust the client blob: keep only recognised keys, de-duplicated.
    const hiddenNav = [...new Set(raw)].filter(isNavKey);

    const settings = await Settings.findOneAndUpdate(
      { key: 'main' },
      { key: 'main', hiddenNav },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    // Bust only the header's cached settings read (used by every page's layout).
    // A tag update refreshes the menu site-wide without wiping the Router Cache
    // of the page the admin is currently on — which path-based layout
    // revalidation did, momentarily 404-ing a route right after hiding it.
    revalidateTag(NAV_SETTINGS_TAG);

    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/settings PUT]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
