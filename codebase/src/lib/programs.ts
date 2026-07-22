import rawPrograms from '@/lib/programs.data.json';
import type { Program as PublicProgram, Localized, LocalizedList } from '@/data/types';

/**
 * Seam pour les cours. La donnée vient désormais du snapshot baké au build
 * (src/lib/programs.data.json, synchronisé depuis l'API Express par
 * scripts/sync-content.mjs) — plus de Mongo ni d'ISR, compatible export statique.
 *
 * L'API publique de ce module (getPrograms / getProgramBySlug /
 * getPublishedProgramSlugs, shape PublicProgram) est INCHANGÉE : la home, le
 * footer, la page horaires, le sitemap et les pages cours continuent de l'appeler
 * tel quel. Seule la source de données a changé.
 */

/** Conservé pour compat avec d'anciennes routes Next encore présentes (no-op). */
export const PROGRAMS_TAG = 'programs';

interface ProgramLean {
  slug: string;
  order: number;
  name: string;
  tagline: string;
  intro: string;
  benefits: string[];
  ageRange: string;
  level: string;
  duration: string;
  image: string;
  imageAlt: string;
}

/** Contenu stocké en français ; le site public le duplique dans chaque locale. */
const loc = (s: string): Localized => ({ fr: s ?? '', en: s ?? '' });
const locList = (a: string[]): LocalizedList => ({ fr: a ?? [], en: a ?? [] });

function toPublic(doc: ProgramLean): PublicProgram {
  return {
    slug: doc.slug,
    order: doc.order ?? 100,
    name: loc(doc.name),
    tagline: loc(doc.tagline),
    intro: loc(doc.intro),
    benefits: locList(doc.benefits ?? []),
    ageRange: loc(doc.ageRange),
    level: loc(doc.level),
    duration: loc(doc.duration),
    image: doc.image ?? '',
    imageAlt: loc(doc.imageAlt),
  };
}

// Snapshot baké → shape publique, trié par ordre puis nom. Le snapshot ne
// contient que les cours PUBLIÉS (l'API /api/programs les filtre déjà).
const publicPrograms: PublicProgram[] = (rawPrograms as ProgramLean[])
  .map(toPublic)
  .sort((a, b) => a.order - b.order || a.name.fr.localeCompare(b.name.fr));

/**
 * Cours publiés lus EN DIRECT depuis l'API (même shape que le snapshot).
 * Utilisé côté client pour refléter l'admin sans redéployer — voir useLiveData.
 */
export async function fetchPrograms(): Promise<PublicProgram[]> {
  const api = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${api}/api/programs`);
  if (!res.ok) throw new Error(`GET /api/programs → ${res.status}`);
  const raw = (await res.json()) as ProgramLean[];
  return raw
    .map(toPublic)
    .sort((a, b) => a.order - b.order || a.name.fr.localeCompare(b.name.fr));
}

/** Cours publiés dans l'ordre d'affichage (shape publique). */
export async function getPrograms(): Promise<PublicProgram[]> {
  return publicPrograms;
}

export async function getProgramBySlug(slug: string): Promise<PublicProgram | undefined> {
  return publicPrograms.find((p) => p.slug === slug);
}

/** Slugs publiés pour generateStaticParams (pages cours pré-générées). */
export async function getPublishedProgramSlugs(): Promise<string[]> {
  return publicPrograms.map((p) => p.slug);
}
