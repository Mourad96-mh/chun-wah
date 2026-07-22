// ---------------------------------------------------------------------------
// Chun Wah — parcours de l'élève (singleton) + snapshot baké.
//
// CLIENT-SAFE : n'importe jamais Mongoose ni de code serveur. La donnée vient du
// snapshot de build (src/lib/roadmap.data.json), synchronisé depuis l'API
// Express par scripts/sync-content.mjs — plus de Mongo ni d'ISR, compatible
// export statique. L'endpoint public ne renvoie le parcours que s'il est publié :
// un brouillon arrive donc ici comme un objet vide, et la page affiche son état
// « bientôt disponible ».
// ---------------------------------------------------------------------------

import rawRoadmap from '@/lib/roadmap.data.json';

export type Roadmap = {
  imageUrl: string;
  imageAlt: string;
  fileUrl: string;
  note: string;
  published: boolean;
};

type RawRoadmap = Partial<Record<keyof Roadmap, unknown>>;

/** Normalise un objet brut (snapshot ou réponse API) en Roadmap. */
export function normalizeRoadmap(raw: unknown): Roadmap {
  const r = (raw ?? {}) as RawRoadmap;
  return {
    imageUrl: String(r.imageUrl ?? '').trim(),
    imageAlt: String(r.imageAlt ?? '').trim(),
    fileUrl: String(r.fileUrl ?? '').trim(),
    note: String(r.note ?? '').trim(),
    published: Boolean(r.published),
  };
}

/** Le parcours publié, lu par la page /parcours (/roadmap en anglais). */
export const roadmap: Roadmap = normalizeRoadmap(rawRoadmap);

/** Vrai quand il y a réellement quelque chose à afficher. */
export function hasRoadmapContent(r: Roadmap = roadmap): boolean {
  return Boolean(r.imageUrl || r.fileUrl);
}
