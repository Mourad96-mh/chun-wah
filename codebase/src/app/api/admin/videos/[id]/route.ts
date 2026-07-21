import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Video } from '@/models/Video';
import { requireSession } from '@/lib/auth';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

function revalidateHome() {
  revalidatePath('/fr');
  revalidatePath('/en');
}

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const video = await Video.findById(id).lean();

    if (!video) {
      return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ video });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/videos/:id GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const video = await Video.findById(id);

    if (!video) {
      return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 });
    }

    const body = await request.json();

    if (body.title !== undefined) video.title = String(body.title).trim();
    if (body.description !== undefined) video.description = String(body.description).trim();
    if (body.videoUrl !== undefined) video.videoUrl = String(body.videoUrl).trim();
    if (body.poster !== undefined) video.poster = String(body.poster).trim();
    if (body.order !== undefined && Number.isFinite(Number(body.order))) {
      video.order = Number(body.order);
    }
    if (body.status !== undefined) {
      video.status = body.status === 'published' ? 'published' : 'draft';
    }

    if (!video.title || !video.videoUrl) {
      return NextResponse.json(
        { error: 'Le titre et la vidéo sont obligatoires.' },
        { status: 400 },
      );
    }

    await video.save();
    revalidateHome();

    return NextResponse.json({ video });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/videos/:id PUT]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 });
    }

    revalidateHome();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/videos/:id DELETE]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
