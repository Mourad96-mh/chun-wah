// ---------------------------------------------------------------------------
// Chun Wah — types des vidéos + snapshot baké.
//
// CLIENT-SAFE : n'importe jamais Mongoose ni de code serveur. La donnée vient de
// l'API Express / du snapshot de build (src/lib/videos.data.json), synchronisé au
// build par scripts/sync-content.mjs. Même pattern que src/lib/books.ts.
// ---------------------------------------------------------------------------

import rawVideos from '@/lib/videos.data.json';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export type Video = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  poster: string;
  order: number;
  status: 'draft' | 'published';
  /** ISO — sert de uploadDate au JSON-LD VideoObject. */
  createdAt?: string;
};

type RawVideo = Record<string, unknown> & {
  _id?: string;
  id?: string;
  title?: string;
  videoUrl?: string;
};

/** Normalise un tableau brut (snapshot ou réponse API) en Video[], trié par ordre. */
export function normalizeVideos(raw: unknown[]): Video[] {
  return (raw as RawVideo[])
    .filter((v) => v && v.title && v.videoUrl)
    .map((v) => ({
      id: String(v._id ?? v.id ?? `${v.title}`),
      title: String(v.title),
      description: String(v.description ?? ''),
      videoUrl: String(v.videoUrl),
      poster: String(v.poster ?? ''),
      order: typeof v.order === 'number' ? v.order : 100,
      status: (v.status as Video['status']) || 'published',
      createdAt: v.createdAt ? String(v.createdAt) : undefined,
    }))
    .sort((a, b) => a.order - b.order);
}

// Snapshot baké — source de vérité de la section vidéos de l'accueil.
export const videos: Video[] = normalizeVideos(rawVideos as unknown[]);

/** Liste publiée en direct (rafraîchit la section côté client si besoin). */
export async function fetchVideos(): Promise<Video[]> {
  const res = await fetch(`${API}/api/videos`);
  if (!res.ok) throw new Error(`GET /api/videos → ${res.status}`);
  return normalizeVideos(await res.json());
}
