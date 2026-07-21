import type { Instructor } from './types';

/**
 * PLACEHOLDER CONTENT — names, grades and bios are invented.
 *
 * Ask the client for: full name, grade / sash / lineage, 3–4 lines of bio,
 * and one portrait photo each (shot on the mat beats a studio headshot).
 */
export const instructors: Instructor[] = [
  {
    slug: 'sifu-placeholder',
    name: 'Sifu [Nom à confirmer]',
    title: { fr: 'Fondateur & instructeur principal', en: 'Founder & head instructor' },
    bio: {
      fr: "Pratiquant depuis plus de vingt ans, il a été formé dans la lignée traditionnelle avant d'ouvrir l'académie. Sa pédagogie privilégie la compréhension du principe avant la répétition de la forme : chaque technique est expliquée, testée, puis mise sous pression.",
      en: 'A practitioner for over twenty years, he trained in the traditional lineage before opening the academy. His teaching puts understanding the principle before repeating the form: every technique is explained, tested, then put under pressure.',
    },
    image: '/images/instructors/instructor-1.jpg',
    credentials: {
      fr: [
        'TODO : grade / sash et année d’obtention',
        'TODO : lignée ou école de formation',
        'TODO : diplôme d’encadrement sportif',
      ],
      en: [
        'TODO: grade / sash and year obtained',
        'TODO: lineage or parent school',
        'TODO: coaching qualification',
      ],
    },
  },
  {
    slug: 'instructeur-2',
    name: '[Nom à confirmer]',
    title: { fr: 'Instructeur – Sanda', en: 'Instructor – Sanda' },
    bio: {
      fr: "Compétiteur puis entraîneur, il encadre les cours de sanda et la préparation physique. Il met l'accent sur la progressivité : l'opposition n'arrive qu'une fois les bases solides, pour que chacun puisse s'entraîner dur sans se blesser.",
      en: 'A competitor turned coach, he runs the sanda classes and strength work. He insists on progression: sparring only comes once the basics are solid, so everyone can train hard without getting hurt.',
    },
    image: '/images/instructors/instructor-2.jpg',
    credentials: {
      fr: ['TODO : palmarès', 'TODO : diplôme', 'TODO : années d’expérience'],
      en: ['TODO: competition record', 'TODO: qualification', 'TODO: years of experience'],
    },
  },
  {
    slug: 'instructrice-3',
    name: '[Nom à confirmer]',
    title: { fr: 'Instructrice – Enfants & self-défense', en: 'Instructor – Kids & self-defence' },
    bio: {
      fr: "Elle encadre les groupes enfants et le programme de self-défense féminine. Son approche repose sur la sécurité, la clarté des consignes et la valorisation : un enfant qui progresse est un enfant qui revient.",
      en: 'She leads the kids groups and the women\'s self-defence programme. Her approach is built on safety, clear instructions and encouragement: a child who progresses is a child who comes back.',
    },
    image: '/images/instructors/instructor-3.jpg',
    credentials: {
      fr: ['TODO : grade', 'TODO : brevet d’animation / secourisme', 'TODO : spécialités'],
      en: ['TODO: grade', 'TODO: youth coaching / first-aid certificate', 'TODO: specialities'],
    },
  },
];

export function getInstructor(slug: string): Instructor | undefined {
  return instructors.find((i) => i.slug === slug);
}
