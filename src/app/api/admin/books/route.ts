import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Book } from '@/models/Book';
import { requireSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireSession();
    await dbConnect();

    const books = await Book.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ books });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/books GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    await dbConnect();

    const body = await request.json();
    const title = String(body.title ?? '').trim();
    const author = String(body.author ?? '').trim();
    const recommendation = String(body.recommendation ?? '').trim();

    if (!title || !author || !recommendation) {
      return NextResponse.json(
        { error: 'Titre, auteur et recommandation sont obligatoires.' },
        { status: 400 },
      );
    }

    const book = await Book.create({
      title,
      author,
      recommendation,
      coverImage: String(body.coverImage ?? '').trim(),
      level: String(body.level ?? '').trim(),
      category: String(body.category ?? '').trim(),
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 100,
      status: body.status === 'published' ? 'published' : 'draft',
    });

    revalidatePath('/fr/livres');

    return NextResponse.json({ book }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/books POST]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
