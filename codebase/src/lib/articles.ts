// ---------------------------------------------------------------------------
// Chun Wah — types du blog + snapshot baké des articles.
//
// Ce fichier est CLIENT-SAFE : il ne doit jamais importer Mongoose ni du code
// serveur. La donnée vit dans l'API Express / un snapshot de build
// (src/lib/articles.data.json), synchronisé au build par scripts/sync-content.mjs.
// Les pages rendues au build utilisent ce snapshot (SEO) ; l'admin et les pages
// blog peuvent rafraîchir en direct depuis l'API dans le navigateur.
// ---------------------------------------------------------------------------

import rawArticles from '@/lib/articles.data.json';

const API = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Article publié tel que servi par `GET /api/articles` et baké dans le snapshot.
 * Le corps Markdown est inclus : les pages blog liste ET détail sont générées
 * au build à partir de ce snapshot (le détail rend le Markdown au build).
 */
export type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  coverImage?: string;
  coverAlt?: string;
  tags?: string[];
  author?: string;
  status?: 'draft' | 'published';
  publishedAt?: string | null;
  updatedAt?: string;
};

/** Détail servi en direct par `GET /api/articles/:slug` : la carte + le HTML rendu. */
export type Article = ArticleCard & {
  /** HTML assaini, rendu côté API par renderMarkdown. */
  html?: string;
};

type RawArticle = Record<string, unknown> & {
  _id?: string;
  id?: string;
  slug?: string;
  title?: string;
};

/** Normalise un tableau brut (snapshot ou réponse API) en ArticleCard[]. */
export function normalizeArticles(raw: unknown[]): ArticleCard[] {
  return (raw as RawArticle[])
    .filter((a) => a && a.slug && a.title)
    .map((a) => ({
      id: String(a._id ?? a.id ?? a.slug),
      slug: String(a.slug),
      title: String(a.title),
      excerpt: String(a.excerpt ?? ''),
      body: (a.body as string) ?? undefined,
      coverImage: (a.coverImage as string) || undefined,
      coverAlt: (a.coverAlt as string) || undefined,
      tags: Array.isArray(a.tags) ? (a.tags as string[]) : [],
      author: (a.author as string) || undefined,
      status: (a.status as ArticleCard['status']) || 'published',
      publishedAt: (a.publishedAt as string) ?? null,
      updatedAt: (a.updatedAt as string) || undefined,
    }));
}

// Snapshot baké — la source de vérité SEO pour les pages générées au build.
export const articles: ArticleCard[] = normalizeArticles(rawArticles as unknown[]);

export function getArticleCard(slug: string): ArticleCard | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Liste des slugs pour generateStaticParams (pages articles pré-générées). */
export function articleSlugs(): string[] {
  return articles.map((a) => a.slug);
}

// --- Lecture en direct depuis l'API (navigateur) ---------------------------

/** Liste publiée en direct (rafraîchit les cartes du blog côté client). */
export async function fetchArticles(): Promise<ArticleCard[]> {
  const res = await fetch(`${API}/api/articles`);
  if (!res.ok) throw new Error(`GET /api/articles → ${res.status}`);
  return normalizeArticles(await res.json());
}

/** Un article publié par slug, avec son HTML rendu (page de détail). */
export async function fetchArticle(slug: string): Promise<Article | null> {
  const res = await fetch(`${API}/api/articles/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /api/articles/${slug} → ${res.status}`);
  return (await res.json()) as Article;
}
