import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Article } from '@/models/Article';
import { requireSession } from '@/lib/auth';
import { uniqueSlug } from '@/lib/slug';
import { toPlainText } from '@/lib/markdown';

export const runtime = 'nodejs';

/** List every article, drafts included — admin only. */
export async function GET() {
  try {
    await requireSession();
    await dbConnect();

    const articles = await Article.find({})
      .sort({ updatedAt: -1 })
      .select('title slug status publishedAt updatedAt excerpt')
      .lean();

    return NextResponse.json({ articles });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/articles GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();

    const body = await request.json();
    const title = String(body.title ?? '').trim();
    const content = String(body.body ?? '');

    if (title.length < 3) {
      return NextResponse.json(
        { error: 'Le titre doit faire au moins 3 caractères.' },
        { status: 400 },
      );
    }

    const status = body.status === 'published' ? 'published' : 'draft';

    const article = await Article.create({
      title,
      slug: await uniqueSlug(Article, body.slug || title),
      excerpt: String(body.excerpt ?? '').trim() || toPlainText(content, 200),
      body: content,
      coverImage: String(body.coverImage ?? '').trim(),
      coverAlt: String(body.coverAlt ?? '').trim(),
      tags: Array.isArray(body.tags)
        ? body.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
        : [],
      author: String(body.author ?? '').trim() || session.name,
      status,
      publishedAt: status === 'published' ? new Date() : null,
    });

    // An article created straight into "published" must appear immediately,
    // not after the ISR window expires.
    if (status === 'published') {
      revalidatePath('/fr/blog');
      revalidatePath(`/fr/blog/${article.slug}`);
      revalidatePath('/sitemap.xml');
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/articles POST]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
