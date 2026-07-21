// ---------------------------------------------------------------------------
// Chun Wah — types des livres + snapshot baké.
//
// CLIENT-SAFE : n'importe jamais Mongoose ni de code serveur. La donnée vient de
// l'API Express / du snapshot de build (src/lib/books.data.json), synchronisé au
// build par scripts/sync-content.mjs. Même pattern que src/lib/articles.ts.
// ---------------------------------------------------------------------------

import rawBooks from '@/lib/books.data.json';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export type Book = {
  id: string;
  title: string;
  author: string;
  recommendation: string;
  coverImage?: string;
  level?: string;
  category?: string;
  order?: number;
  status?: 'draft' | 'published';
};

type RawBook = Record<string, unknown> & {
  _id?: string;
  id?: string;
  title?: string;
  author?: string;
};

/** Normalise un tableau brut (snapshot ou réponse API) en Book[], trié par ordre. */
export function normalizeBooks(raw: unknown[]): Book[] {
  return (raw as RawBook[])
    .filter((b) => b && b.title && b.author)
    .map((b) => ({
      id: String(b._id ?? b.id ?? `${b.title}`),
      title: String(b.title),
      author: String(b.author),
      recommendation: String(b.recommendation ?? ''),
      coverImage: (b.coverImage as string) || undefined,
      level: (b.level as string) || undefined,
      category: (b.category as string) || undefined,
      order: typeof b.order === 'number' ? b.order : 100,
      status: (b.status as Book['status']) || 'published',
    }))
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

// Snapshot baké — source de vérité SEO pour la page Livres générée au build.
export const books: Book[] = normalizeBooks(rawBooks as unknown[]);

/** Liste publiée en direct (rafraîchit la page Livres côté client si besoin). */
export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`${API}/api/books`);
  if (!res.ok) throw new Error(`GET /api/books → ${res.status}`);
  return normalizeBooks(await res.json());
}
