import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Video } from '@/models/Video';
import { requireSession } from '@/lib/auth';

export const runtime = 'nodejs';

/** The home page is ISR and shows published videos — refresh both locales. */
function revalidateHome() {
  revalidatePath('/fr');
  revalidatePath('/en');
}

export async function GET() {
  try {
    await requireSession();
    await dbConnect();

    const videos = await Video.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ videos });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/videos GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    await dbConnect();

    const body = await request.json();
    const title = String(body.title ?? '').trim();
    const videoUrl = String(body.videoUrl ?? '').trim();

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: 'Le titre et la vidéo sont obligatoires.' },
        { status: 400 },
      );
    }

    const video = await Video.create({
      title,
      videoUrl,
      description: String(body.description ?? '').trim(),
      poster: String(body.poster ?? '').trim(),
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 100,
      status: body.status === 'published' ? 'published' : 'draft',
    });

    revalidateHome();

    return NextResponse.json({ video }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/videos POST]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
