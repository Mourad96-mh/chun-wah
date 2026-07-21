import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Book } from '@/models/Book';
import { requireSession } from '@/lib/auth';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const book = await Book.findById(id).lean();

    if (!book) {
      return NextResponse.json({ error: 'Livre introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ book });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/books/:id GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const book = await Book.findById(id);

    if (!book) {
      return NextResponse.json({ error: 'Livre introuvable.' }, { status: 404 });
    }

    const body = await request.json();

    if (body.title !== undefined) book.title = String(body.title).trim();
    if (body.author !== undefined) book.author = String(body.author).trim();
    if (body.recommendation !== undefined) {
      book.recommendation = String(body.recommendation).trim();
    }
    if (body.coverImage !== undefined) book.coverImage = String(body.coverImage).trim();
    if (body.level !== undefined) book.level = String(body.level).trim();
    if (body.category !== undefined) book.category = String(body.category).trim();
    if (body.order !== undefined && Number.isFinite(Number(body.order))) {
      book.order = Number(body.order);
    }
    if (body.status !== undefined) {
      book.status = body.status === 'published' ? 'published' : 'draft';
    }

    if (!book.title || !book.author || !book.recommendation) {
      return NextResponse.json(
        { error: 'Titre, auteur et recommandation sont obligatoires.' },
        { status: 400 },
      );
    }

    await book.save();
    revalidatePath('/fr/livres');

    return NextResponse.json({ book });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/books/:id PUT]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return NextResponse.json({ error: 'Livre introuvable.' }, { status: 404 });
    }

    revalidatePath('/fr/livres');
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/books/:id DELETE]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
