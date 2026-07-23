// ---------------------------------------------------------------------------
// Chun Wah — équipe (instructeurs & encadrants) : COLLECTION + snapshot baké.
//
// CLIENT-SAFE : n'importe jamais Mongoose ni de code serveur. La donnée vient du
// snapshot de build (src/lib/team.data.json), synchronisé depuis l'API Express
// par scripts/sync-content.mjs, et rafraîchie en direct côté client (useLiveData).
//
// Remplace le roster public de data/instructors.ts. Tant que l'admin n'a pas créé
// de membre, on RETOMBE sur ce roster statique (converti au format Équipe) pour
// que la page /equipe ne soit jamais vide pendant la transition.
// ---------------------------------------------------------------------------

import rawTeam from '@/lib/team.data.json';
import { instructors as staticInstructors } from '@/data/instructors';
import type { Localized } from '@/data/types';

/** Membre tel que stocké dans le snapshot / renvoyé par l'API. */
interface TeamMemberLean {
  _id: string;
  slug?: string;
  name: string;
  roleFr?: string;
  roleEn?: string;
  bioFr?: string;
  bioEn?: string;
  image?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  order?: number;
  active?: boolean;
}

export interface TeamSocials {
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}

/** Membre consommé par le site (texte replié en Localized). */
export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: Localized;
  bio: Localized;
  image: string;
  socials: TeamSocials;
}

function toMember(doc: TeamMemberLean): TeamMember {
  return {
    id: doc._id,
    slug: doc.slug || '',
    name: doc.name ?? '',
    role: { fr: doc.roleFr ?? '', en: doc.roleEn ?? '' },
    bio: { fr: doc.bioFr ?? '', en: doc.bioEn ?? '' },
    image: doc.image ?? '',
    socials: {
      facebook: doc.facebook ?? '',
      instagram: doc.instagram ?? '',
      youtube: doc.youtube ?? '',
      tiktok: doc.tiktok ?? '',
    },
  };
}

function sortAndMap(docs: TeamMemberLean[]): TeamMember[] {
  return [...docs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(toMember);
}

const noSocials: TeamSocials = { facebook: '', instagram: '', youtube: '', tiktok: '' };

/** Roster statique (placeholder) converti au format Équipe — repli si vide. */
const staticFallback: TeamMember[] = staticInstructors.map((i) => ({
  id: i.slug,
  slug: i.slug,
  name: i.name,
  role: i.title,
  bio: i.bio,
  image: i.image,
  socials: noSocials,
}));

/** Membres bakés au build ; repli sur le roster statique tant qu'aucun n'existe. */
const bakedTeam: TeamMember[] = sortAndMap(rawTeam as TeamMemberLean[]);

/** Membres de l'équipe, dans l'ordre d'affichage (snapshot baké ou repli). */
export function getTeam(): TeamMember[] {
  return bakedTeam.length ? bakedTeam : staticFallback;
}

/** Membres lus EN DIRECT depuis l'API (même shape que le snapshot). */
export async function fetchTeam(): Promise<TeamMember[]> {
  const api = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${api}/api/team`);
  if (!res.ok) throw new Error(`GET /api/team → ${res.status}`);
  const raw = (await res.json()) as TeamMemberLean[];
  return sortAndMap(raw);
}
