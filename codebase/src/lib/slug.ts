import slugify from 'slugify';
import type { Model } from 'mongoose';

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, locale: 'fr' });
}

/**
 * Slug that is unique within a collection. Appends -2, -3, … on collision.
 * `excludeId` lets a document keep its own slug while being edited.
 */
export async function uniqueSlug(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  desired: string,
  excludeId?: string,
): Promise<string> {
  const base = toSlug(desired) || 'article';
  let candidate = base;
  let n = 1;

  // Bounded so a pathological case cannot spin forever.
  while (n < 200) {
    const query: Record<string, unknown> = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };

    const clash = await model.exists(query);
    if (!clash) return candidate;

    n += 1;
    candidate = `${base}-${n}`;
  }

  return `${base}-${Date.now()}`;
}
