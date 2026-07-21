import { unstable_cache } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Program } from '@/models/Program';
import type { Program as PublicProgram, Localized, LocalizedList } from '@/data/types';

/** Cache tag tying every page's program read to the admin save (revalidateTag). */
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

/** Content is stored in French; the public site duplicates it into every locale. */
const loc = (s: string): Localized => ({ fr: s ?? '', en: s ?? '' });
const locList = (a: string[]): LocalizedList => ({ fr: a ?? [], en: a ?? [] });

function toPublic(doc: ProgramLean): PublicProgram {
  return {
    slug: doc.slug,
    order: doc.order ?? 100,
    name: loc(doc.name),
    tagline: loc(doc.tagline),
    intro: loc(doc.intro),
    benefits: locList(doc.benefits),
    ageRange: loc(doc.ageRange),
    level: loc(doc.level),
    duration: loc(doc.duration),
    image: doc.image ?? '',
    imageAlt: loc(doc.imageAlt),
  };
}

async function readPrograms(): Promise<PublicProgram[]> {
  await dbConnect();
  const docs = await Program.find({ status: 'published' })
    .sort({ order: 1, createdAt: 1 })
    .lean<ProgramLean[]>();
  return docs.map(toPublic);
}

const cachedPrograms = unstable_cache(readPrograms, ['programs'], { tags: [PROGRAMS_TAG] });

/**
 * Published courses in display order, in the public `Program` shape. Never throws:
 * a DB hiccup degrades to an empty list rather than taking the site down.
 */
export async function getPrograms(): Promise<PublicProgram[]> {
  try {
    return await cachedPrograms();
  } catch (err) {
    console.error('[programs] unavailable:', err);
    return [];
  }
}

export async function getProgramBySlug(slug: string): Promise<PublicProgram | undefined> {
  const all = await getPrograms();
  return all.find((p) => p.slug === slug);
}

/**
 * Published slugs for generateStaticParams. Read uncached/direct so a fresh build
 * always sees the current set; new courses added later still render via ISR
 * (dynamicParams). Returns [] on error so the build never fails on the DB.
 */
export async function getPublishedProgramSlugs(): Promise<string[]> {
  try {
    await dbConnect();
    const docs = await Program.find({ status: 'published' }).select('slug').lean<{ slug: string }[]>();
    return docs.map((d) => d.slug);
  } catch (err) {
    console.error('[programs] slug list unavailable:', err);
    return [];
  }
}
