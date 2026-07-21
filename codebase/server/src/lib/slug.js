import slugify from 'slugify';

export function toSlug(input) {
  return slugify(String(input || ''), { lower: true, strict: true, locale: 'fr' });
}

/**
 * Slug unique dans une collection. Ajoute -2, -3, … en cas de collision.
 * `excludeId` permet à un document de garder son propre slug pendant l'édition.
 */
export async function uniqueSlug(model, desired, excludeId) {
  const base = toSlug(desired) || 'article';
  let candidate = base;
  let n = 1;

  while (n < 200) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };

    const clash = await model.exists(query);
    if (!clash) return candidate;

    n += 1;
    candidate = `${base}-${n}`;
  }

  return `${base}-${Date.now()}`;
}
