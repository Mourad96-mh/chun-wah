import type { RoadmapStage } from './types';

/**
 * The learner's progression path, rendered as a designed timeline on /parcours.
 *
 * PLACEHOLDER CONTENT — these six stages are a sensible martial-arts progression
 * but they are invented. TODO: have the client confirm the real stages, level
 * names (belts/sashes/grades) and indicative durations, then edit them here.
 * Adding or removing a stage automatically renumbers the timeline.
 */
export const roadmapStages: RoadmapStage[] = [
  {
    level: { fr: 'Premiers pas', en: 'First steps' },
    title: { fr: 'Découverte', en: 'Discovery' },
    description: {
      fr: 'Votre premier cours d’essai gratuit. On vous accueille, on vous montre la salle et on pratique dès le premier jour — aucun prérequis, aucune tenue à acheter.',
      en: 'Your free trial class. We welcome you, show you the room and get you practising from day one — no prerequisites, no gear to buy.',
    },
    focus: {
      fr: ['Posture et garde', 'Déplacements de base', 'Respiration'],
      en: ['Stance and guard', 'Basic footwork', 'Breathing'],
    },
    duration: { fr: '1er cours', en: 'First class' },
  },
  {
    level: { fr: 'Débutant', en: 'Beginner' },
    title: { fr: 'Fondations', en: 'Foundations' },
    description: {
      fr: 'On installe les bases qui serviront toute la vie : les positions justes, les premiers enchaînements et le vocabulaire de la discipline. La régularité prime sur la performance.',
      en: 'We lay the base you build on for life: correct positions, your first combinations and the vocabulary of the art. Consistency matters more than performance.',
    },
    focus: {
      fr: ['Techniques de base', 'Premiers enchaînements', 'Coordination'],
      en: ['Core techniques', 'First combinations', 'Coordination'],
    },
    duration: { fr: '0–6 mois', en: '0–6 months' },
  },
  {
    level: { fr: 'Intermédiaire', en: 'Intermediate' },
    title: { fr: 'Progression', en: 'Building up' },
    description: {
      fr: 'Le travail à deux commence vraiment : applications, sensibilité et contrôle. On développe le conditionnement physique et la lecture de l’adversaire.',
      en: 'Partner work begins in earnest: applications, sensitivity and control. You develop conditioning and start reading your opponent.',
    },
    focus: {
      fr: ['Travail à deux', 'Applications', 'Conditionnement'],
      en: ['Partner drills', 'Applications', 'Conditioning'],
    },
    duration: { fr: '6–18 mois', en: '6–18 months' },
  },
  {
    level: { fr: 'Confirmé', en: 'Advanced' },
    title: { fr: 'Perfectionnement', en: 'Refinement' },
    description: {
      fr: 'La technique devient fluide et personnelle. Sparring encadré, formes avancées et gestion de la distance et du timing sous pression.',
      en: 'Technique becomes fluid and personal. Supervised sparring, advanced forms, and managing distance and timing under pressure.',
    },
    focus: {
      fr: ['Sparring encadré', 'Formes avancées', 'Timing et distance'],
      en: ['Supervised sparring', 'Advanced forms', 'Timing and distance'],
    },
    duration: { fr: '18 mois – 3 ans', en: '18 months – 3 years' },
  },
  {
    level: { fr: 'Avancé', en: 'Senior' },
    title: { fr: 'Maîtrise', en: 'Mastery' },
    description: {
      fr: 'Autonomie complète dans la pratique. Combat libre, travail des armes ou des formes selon la discipline, et un style qui vous est propre.',
      en: 'Full autonomy in your practice. Free fighting, weapons or forms depending on the discipline, and a style that is truly your own.',
    },
    focus: {
      fr: ['Combat libre', 'Armes / formes', 'Style personnel'],
      en: ['Free fighting', 'Weapons / forms', 'Personal style'],
    },
    duration: { fr: '3 ans et +', en: '3 years and up' },
  },
  {
    level: { fr: 'Instructeur', en: 'Instructor' },
    title: { fr: 'Transmission', en: 'Passing it on' },
    description: {
      fr: 'Le dernier apprentissage est d’enseigner. Assister les cours, encadrer les débutants et transmettre à votre tour la discipline qui vous a formé.',
      en: 'The final learning is to teach. Assisting classes, mentoring beginners and passing on the art that shaped you.',
    },
    focus: {
      fr: ['Assistanat', 'Encadrement', 'Transmission'],
      en: ['Assisting', 'Mentoring', 'Teaching'],
    },
    duration: { fr: 'Sur invitation', en: 'By invitation' },
  },
];
