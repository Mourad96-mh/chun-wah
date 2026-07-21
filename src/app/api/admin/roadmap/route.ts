import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Roadmap } from '@/models/Roadmap';
import { requireSession } from '@/lib/auth';

export const runtime = 'nodejs';

/** The /parcours page (FR) and /roadmap page (EN) both render this document. */
function revalidateRoadmap() {
  revalidatePath('/fr/parcours');
  revalidatePath('/en/roadmap');
}

export async function GET() {
  try {
    await requireSession();
    await dbConnect();

    const roadmap = await Roadmap.findOne({ key: 'main' }).lean();
    return NextResponse.json({ roadmap });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/roadmap GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireSession();
    await dbConnect();

    const body = await request.json();
    const imageUrl = String(body.imageUrl ?? '').trim();
    const fileUrl = String(body.fileUrl ?? '').trim();
    const published = Boolean(body.published);

    // Publishing needs *something* to show — either the inline image or a file
    // (a PDF the page can embed / offer for download).
    if (published && !imageUrl && !fileUrl) {
      return NextResponse.json(
        { error: 'Ajoutez une image ou un PDF du parcours avant de le publier.' },
        { status: 400 },
      );
    }

    const roadmap = await Roadmap.findOneAndUpdate(
      { key: 'main' },
      {
        key: 'main',
        imageUrl,
        imageAlt: String(body.imageAlt ?? '').trim(),
        fileUrl,
        note: String(body.note ?? '').trim(),
        published,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    revalidateRoadmap();

    return NextResponse.json({ roadmap });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/roadmap PUT]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
