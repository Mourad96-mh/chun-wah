import type { Testimonial } from './types';

/**
 * PLACEHOLDER TESTIMONIALS — these are invented and MUST be replaced with real
 * ones before launch. Publishing fabricated reviews is both dishonest and, for
 * a business, legally risky.
 *
 * Best source: the club's Google Business Profile reviews (ask the client to
 * screenshot them), or a WhatsApp message asking 3–4 loyal students directly.
 * Keep the reviewer's first name + last initial and get their OK to publish.
 */
export const testimonials: Testimonial[] = [
  {
    name: '[Prénom N.]',
    role: { fr: 'Élève depuis 2 ans', en: 'Student for 2 years' },
    quote: {
      fr: "Texte d'avis à remplacer. Idéalement 2 à 3 phrases qui disent ce que la personne cherchait, ce qu'elle a trouvé, et ce qui a changé pour elle.",
      en: 'Placeholder review text. Ideally 2–3 sentences saying what the person was looking for, what they found, and what changed for them.',
    },
    rating: 5,
  },
  {
    name: '[Prénom N.]',
    role: { fr: 'Parent d’élève', en: 'Parent of a student' },
    quote: {
      fr: "Texte d'avis à remplacer. Un avis de parent est précieux : il rassure les autres parents sur l'encadrement et la sécurité.",
      en: 'Placeholder review text. A parent review is valuable: it reassures other parents about supervision and safety.',
    },
    rating: 5,
  },
  {
    name: '[Prénom N.]',
    role: { fr: 'Débutante, self-défense', en: 'Beginner, self-defence' },
    quote: {
      fr: "Texte d'avis à remplacer. Un avis de grand débutant lève la principale objection : « je ne suis pas assez sportif pour commencer ».",
      en: 'Placeholder review text. A complete-beginner review removes the main objection: "I\'m not fit enough to start".',
    },
    rating: 5,
  },
];
