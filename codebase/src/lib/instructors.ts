import { instructors as staticInstructors } from '@/data/instructors';
import type { Instructor } from '@/data/types';
import { getMediaMap } from '@/lib/media';

/**
 * Instructors with client overrides applied. Content lives in data/instructors.ts;
 * the admin (via /admin/medias) can override the display name per instructor. Any
 * page that shows an instructor name should read from here so the override is
 * consistent everywhere (roster, timetable, program pages).
 */
export async function getInstructors(): Promise<Instructor[]> {
  const media = await getMediaMap();
  return staticInstructors.map((i) => {
    const name = media[`instructor:${i.slug}`]?.name?.trim();
    return name ? { ...i, name } : i;
  });
}

/** Same data, keyed by slug for O(1) lookup (e.g. a program's teachers). */
export async function getInstructorMap(): Promise<Map<string, Instructor>> {
  const list = await getInstructors();
  return new Map(list.map((i) => [i.slug, i]));
}
