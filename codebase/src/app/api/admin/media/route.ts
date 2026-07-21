import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Media } from '@/models/Media';
import { requireSession } from '@/lib/auth';
import { MEDIA_KEYS, MEDIA_TAG } from '@/lib/media';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireSession();
    await dbConnect();

    const media = await Media.findOne({ key: 'main' }).lean();
    return NextResponse.json({ media });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/media GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireSession();
    await dbConnect();

    const body = await request.json();
    const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];

    // Never trust the client blob: keep only known slots, one entry per slot.
    const seen = new Set<string>();
    const items = rawItems
      .map((it) => (it && typeof it === 'object' ? (it as Record<string, unknown>) : {}))
      .filter((it) => MEDIA_KEYS.includes(String(it.slot)) && !seen.has(String(it.slot)) && seen.add(String(it.slot)))
      .map((it) => ({
        slot: String(it.slot),
        url: String(it.url ?? '').trim(),
        alt: String(it.alt ?? '').trim().slice(0, 300),
        name: String(it.name ?? '').trim().slice(0, 120),
      }));

    const media = await Media.findOneAndUpdate(
      { key: 'main' },
      { key: 'main', items },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    // Bust the cached media read used by every page's render (hero, à propos,
    // instructor portraits) so the new images appear site-wide immediately.
    revalidateTag(MEDIA_TAG);

    return NextResponse.json({ media });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/media PUT]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
