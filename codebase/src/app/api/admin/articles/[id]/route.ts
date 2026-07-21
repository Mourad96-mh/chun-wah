import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Article } from '@/models/Article';
import { requireSession } from '@/lib/auth';
import { uniqueSlug } from '@/lib/slug';
import { toPlainText } from '@/lib/markdown';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const article = await Article.findById(id).lean();

    if (!article) {
      return NextResponse.json({ error: 'Article introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/articles/:id GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json({ error: 'Article introuvable.' }, { status: 404 });
    }

    const body = await request.json();
    const previousSlug = article.slug;
    const wasPublished = article.status === 'published';

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (title.length < 3) {
        return NextResponse.json(
          { error: 'Le titre doit faire au moins 3 caractères.' },
          { status: 400 },
        );
      }
      article.title = title;
    }

    // Only recompute the slug when explicitly given: changing it after
    // publication breaks every existing link to the article.
    if (body.slug !== undefined && String(body.slug).trim()) {
      article.slug = await uniqueSlug(Article, String(body.slug), id);
    }

    if (body.body !== undefined) article.body = String(body.body);
    if (body.coverImage !== undefined) article.coverImage = String(body.coverImage).trim();
    if (body.coverAlt !== undefined) article.coverAlt = String(body.coverAlt).trim();
    if (body.author !== undefined) article.author = String(body.author).trim();

    if (body.excerpt !== undefined) {
      article.excerpt = String(body.excerpt).trim() || toPlainText(article.body, 200);
    }

    if (body.tags !== undefined) {
      article.tags = Array.isArray(body.tags)
        ? body.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
        : [];
    }

    if (body.status !== undefined) {
      const status = body.status === 'published' ? 'published' : 'draft';
      article.status = status;
      // Stamp the publication date once, on first publish only.
      if (status === 'published' && !article.publishedAt) {
        article.publishedAt = new Date();
      }
    }

    await article.save();

    // Refresh the public pages this change affects.
    revalidatePath('/fr/blog');
    revalidatePath(`/fr/blog/${article.slug}`);
    if (previousSlug !== article.slug) revalidatePath(`/fr/blog/${previousSlug}`);
    if (wasPublished !== (article.status === 'published')) revalidatePath('/sitemap.xml');

    return NextResponse.json({ article });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/articles/:id PUT]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return NextResponse.json({ error: 'Article introuvable.' }, { status: 404 });
    }

    revalidatePath('/fr/blog');
    revalidatePath(`/fr/blog/${article.slug}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/articles/:id DELETE]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
