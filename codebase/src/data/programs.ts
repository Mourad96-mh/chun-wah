import type { Program } from './types';

/**
 * PLACEHOLDER CONTENT.
 *
 * The disciplines below are an educated guess for a Chun Wah kung fu academy.
 * Replace the list with what the club actually teaches: add, remove or rename
 * freely — the nav, the programs grid, the schedule filter and the sitemap all
 * derive from this array, so nothing else needs editing.
 */
export const programs: Program[] = [
  {
    slug: 'wing-chun-adultes',
    order: 1,
    name: { fr: 'Wing Chun Adultes', en: 'Adults Wing Chun' },
    tagline: {
      fr: "L'art martial de la ligne droite : efficace, direct, accessible à tous.",
      en: 'The martial art of the straight line: efficient, direct, open to everyone.',
    },
    intro: {
      fr: "Le Wing Chun est un art martial chinois pensé pour la self-défense réelle : économie de mouvement, contrôle de l'axe central et réflexes développés au contact. Nos cours adultes mêlent travail technique, chi sao et mises en situation, dans une ambiance exigeante mais bienveillante. Aucun prérequis physique : chacun progresse à son rythme.",
      en: 'Wing Chun is a Chinese martial art built for real self-defence: economy of motion, control of the centre line, and reflexes trained through contact. Our adult classes combine technical drilling, chi sao and scenario work in a demanding but supportive atmosphere. No physical prerequisite — everyone progresses at their own pace.',
    },
    benefits: {
      fr: [
        'Self-défense applicable dès les premiers mois',
        'Condition physique et coordination',
        'Gestion du stress et de la distance',
        'Progression structurée par niveaux',
      ],
      en: [
        'Self-defence you can apply within the first months',
        'Fitness and coordination',
        'Stress and distance management',
        'Structured level-by-level progression',
      ],
    },
    ageRange: { fr: '16 ans et +', en: '16 and over' },
    level: { fr: 'Débutant à avancé', en: 'Beginner to advanced' },
    duration: { fr: '1 h 30', en: '1 hr 30' },
    image: '/images/programs/wing-chun-adultes.jpg',
    imageAlt: {
      fr: 'Deux pratiquants de Wing Chun en exercice de chi sao',
      en: 'Two Wing Chun practitioners drilling chi sao',
    },
  },
  {
    slug: 'kung-fu-enfants',
    order: 2,
    name: { fr: 'Kung-Fu Enfants', en: 'Kids Kung Fu' },
    tagline: {
      fr: 'Discipline, confiance et motricité, dans un cadre ludique et sécurisé.',
      en: 'Discipline, confidence and motor skills, in a playful and safe setting.',
    },
    intro: {
      fr: "Nos cours enfants transmettent les bases du kung-fu à travers le jeu, les parcours et les exercices en binôme. L'accent est mis sur le respect, l'écoute et la persévérance autant que sur la technique. Les groupes sont constitués par tranche d'âge pour que chaque enfant évolue avec ses pairs.",
      en: 'Our kids classes teach kung fu fundamentals through games, obstacle work and partner drills. Respect, listening and perseverance matter as much as technique. Groups are split by age band so every child trains alongside their peers.',
    },
    benefits: {
      fr: [
        'Confiance en soi et gestion des conflits',
        'Motricité, équilibre et souplesse',
        'Respect des règles et du partenaire',
        'Passages de grades réguliers',
      ],
      en: [
        'Self-confidence and conflict management',
        'Motor skills, balance and flexibility',
        'Respect for rules and training partners',
        'Regular grading milestones',
      ],
    },
    ageRange: { fr: '6 – 12 ans', en: 'Ages 6 – 12' },
    level: { fr: 'Tous niveaux', en: 'All levels' },
    duration: { fr: '1 h', en: '1 hr' },
    image: '/images/programs/kung-fu-enfants.jpg',
    imageAlt: {
      fr: 'Groupe d’enfants en tenue de kung-fu pendant un cours',
      en: 'Group of children in kung fu uniforms during a class',
    },
  },
  {
    slug: 'self-defense-femmes',
    order: 3,
    name: { fr: 'Self-Défense Femmes', en: "Women's Self-Defence" },
    tagline: {
      fr: 'Des réflexes simples et efficaces, entre femmes, sans jugement.',
      en: 'Simple, effective reflexes — women only, no judgement.',
    },
    intro: {
      fr: "Un programme court et concret, centré sur les situations réellement rencontrées : saisies, agressions verbales, sorties de danger. Les techniques retenues sont celles qui fonctionnent sans force physique supérieure. Le cours est encadré en non-mixité pour permettre à chacune de s'exprimer librement.",
      en: 'A short, concrete programme built around situations that actually happen: grabs, verbal aggression, escaping danger. The techniques taught are those that work without needing superior physical strength. Classes are women-only so everyone can train freely.',
    },
    benefits: {
      fr: [
        'Réflexes de dégagement et de fuite',
        'Lecture des situations à risque',
        'Voix, posture et affirmation de soi',
        'Format court : résultats rapides',
      ],
      en: [
        'Escape and disengagement reflexes',
        'Reading risky situations',
        'Voice, posture and assertiveness',
        'Short format: fast results',
      ],
    },
    ageRange: { fr: '16 ans et +', en: '16 and over' },
    level: { fr: 'Débutant', en: 'Beginner' },
    duration: { fr: '1 h 15', en: '1 hr 15' },
    image: '/images/programs/self-defense-femmes.jpg',
    imageAlt: {
      fr: 'Cours de self-défense féminine, exercice de dégagement',
      en: "Women's self-defence class practising an escape drill",
    },
  },
  {
    slug: 'sanda',
    order: 4,
    name: { fr: 'Sanda – Boxe Chinoise', en: 'Sanda – Chinese Boxing' },
    tagline: {
      fr: 'Percussion, projections et cardio : la face sportive du kung-fu.',
      en: 'Striking, throws and cardio: the competitive face of kung fu.',
    },
    intro: {
      fr: "Le sanda combine coups de poing, coups de pied et projections dans un cadre sportif et encadré. Les séances alternent travail technique, sac, pattes et opposition progressive. C'est le cours idéal pour ceux qui veulent transpirer et, s'ils le souhaitent, aller vers la compétition.",
      en: 'Sanda combines punches, kicks and throws in a supervised competitive framework. Sessions alternate technical work, bag rounds, pad work and progressive sparring. This is the class for anyone who wants to sweat and, if they choose, move towards competition.',
    },
    benefits: {
      fr: [
        'Cardio et puissance',
        'Timing et gestion de la distance',
        'Sparring progressif et encadré',
        'Préparation à la compétition (optionnelle)',
      ],
      en: [
        'Cardio and power',
        'Timing and distance management',
        'Progressive, supervised sparring',
        'Optional competition preparation',
      ],
    },
    ageRange: { fr: '16 ans et +', en: '16 and over' },
    level: { fr: 'Intermédiaire à avancé', en: 'Intermediate to advanced' },
    duration: { fr: '1 h 30', en: '1 hr 30' },
    image: '/images/programs/sanda.jpg',
    imageAlt: {
      fr: 'Pratiquant de sanda frappant dans les pattes d’ours',
      en: 'Sanda practitioner striking focus pads',
    },
  },
  {
    slug: 'tai-chi',
    order: 5,
    name: { fr: 'Tai-Chi & Qi Gong', en: 'Tai Chi & Qi Gong' },
    tagline: {
      fr: 'Mobilité, respiration et calme intérieur, à tout âge.',
      en: 'Mobility, breathing and inner calm, at any age.',
    },
    intro: {
      fr: "Un cours lent, précis et profond, accessible à tous les âges et à toutes les conditions physiques. Le travail de forme, de respiration et d'enracinement améliore l'équilibre, soulage les tensions et complète parfaitement une pratique martiale plus intense.",
      en: 'A slow, precise and deep class, open to every age and fitness level. Form work, breathing and rooting improve balance, release tension, and complement a more intense martial practice perfectly.',
    },
    benefits: {
      fr: [
        'Équilibre et mobilité articulaire',
        'Réduction du stress et du mal de dos',
        'Respiration et concentration',
        'Aucune contrainte physique',
      ],
      en: [
        'Balance and joint mobility',
        'Less stress and back pain',
        'Breathing and focus',
        'No physical strain',
      ],
    },
    ageRange: { fr: 'Tous âges', en: 'All ages' },
    level: { fr: 'Tous niveaux', en: 'All levels' },
    duration: { fr: '1 h', en: '1 hr' },
    image: '/images/programs/tai-chi.jpg',
    imageAlt: {
      fr: 'Pratique de tai-chi en groupe dans la salle',
      en: 'Group tai chi practice in the training hall',
    },
  },
];

export const programsByOrder = [...programs].sort((a, b) => a.order - b.order);

export function getProgram(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}
