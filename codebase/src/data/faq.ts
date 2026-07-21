import type { FaqItem } from './types';

/**
 * PLACEHOLDER — the questions mirror those on the reference sites and are the
 * ones beginners actually ask. Have the client correct every answer, especially
 * anything about pricing, equipment and trial conditions.
 *
 * This list also feeds the FAQPage JSON-LD, so keep answers self-contained.
 */
export const faq: FaqItem[] = [
  {
    question: {
      fr: 'Je n’ai jamais fait d’arts martiaux, puis-je commencer ?',
      en: 'I have never done martial arts — can I start?',
    },
    answer: {
      fr: "Oui. La majorité de nos nouveaux élèves n'ont aucune expérience. Les cours débutants partent de zéro et vous serez encadré individuellement pendant vos premières séances.",
      en: 'Yes. Most of our new students have no experience at all. Beginner classes start from scratch and you will be coached individually during your first sessions.',
    },
  },
  {
    question: {
      fr: 'Faut-il être en bonne condition physique ?',
      en: 'Do I need to be fit?',
    },
    answer: {
      fr: "Non. La condition physique se construit avec la pratique, pas avant. Chaque exercice a une version adaptée et vous restez libre de votre intensité.",
      en: 'No. Fitness is built through practice, not before it. Every exercise has a scaled version and you stay in control of your own intensity.',
    },
  },
  {
    question: {
      fr: 'Que faut-il apporter au premier cours ?',
      en: 'What should I bring to my first class?',
    },
    answer: {
      fr: 'Une tenue de sport confortable, une bouteille d’eau et une serviette. La tenue officielle de l’académie n’est nécessaire qu’après quelques semaines. TODO : confirmer avec le club.',
      en: 'Comfortable sportswear, a water bottle and a towel. The official academy uniform is only needed after a few weeks. TODO: confirm with the club.',
    },
  },
  {
    question: {
      fr: 'Le cours d’essai est-il vraiment gratuit ?',
      en: 'Is the trial class really free?',
    },
    answer: {
      fr: 'Oui, le premier cours est offert et sans engagement. Réservez votre créneau via le formulaire ou par WhatsApp. TODO : confirmer les conditions.',
      en: 'Yes, your first class is free with no commitment. Book your slot through the form or on WhatsApp. TODO: confirm the exact terms.',
    },
  },
  {
    question: {
      fr: 'À partir de quel âge les enfants peuvent-ils s’inscrire ?',
      en: 'From what age can children join?',
    },
    answer: {
      fr: 'Les groupes enfants accueillent les 6 – 12 ans, répartis par tranche d’âge. TODO : confirmer les tranches réelles.',
      en: 'Kids groups take children aged 6 – 12, split into age bands. TODO: confirm the real age bands.',
    },
  },
  {
    question: {
      fr: 'Quels sont les tarifs ?',
      en: 'How much does it cost?',
    },
    answer: {
      fr: "Les tarifs dépendent de la formule choisie (mensuelle, trimestrielle, annuelle) et du nombre de cours par semaine. Contactez-nous pour la grille à jour. TODO : décider avec le client si les prix s'affichent sur le site.",
      en: 'Pricing depends on the plan (monthly, quarterly, yearly) and how many classes per week you attend. Contact us for the current rates. TODO: decide with the client whether prices go on the site.',
    },
  },
];
