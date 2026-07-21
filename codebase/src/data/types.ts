import type { Locale } from '@/i18n/routing';

/** A string that exists in every supported locale. */
export type Localized = Record<Locale, string>;

/** A list of strings that exists in every supported locale. */
export type LocalizedList = Record<Locale, string[]>;

export interface Program {
  slug: string;
  /** Order in nav and on the programs grid. */
  order: number;
  name: Localized;
  /** One line, used on cards and in meta descriptions. */
  tagline: Localized;
  /** Full intro paragraph on the program page. */
  intro: Localized;
  /** Bullet points: what the student gets out of it. */
  benefits: LocalizedList;
  ageRange: Localized;
  level: Localized;
  duration: Localized;
  /** Path relative to /public. */
  image: string;
  imageAlt: Localized;
}

export interface Instructor {
  slug: string;
  name: string;
  /** Grade, belt, sash or lineage title. */
  title: Localized;
  bio: Localized;
  image: string;
  credentials: LocalizedList;
}

export interface ScheduleSlot {
  /** 1 = Monday … 7 = Sunday. */
  day: number;
  start: string;
  end: string;
  /** Must match a Program.slug. */
  programSlug: string;
  instructorSlug?: string;
}

export interface Testimonial {
  name: string;
  /** e.g. "Élève depuis 2 ans" */
  role: Localized;
  quote: Localized;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface FaqItem {
  question: Localized;
  answer: Localized;
}

export interface RoadmapStage {
  /** Short badge, e.g. "Débutant", "Ceinture jaune". */
  level: Localized;
  title: Localized;
  description: Localized;
  /** A few concrete things worked on at this stage. */
  focus: LocalizedList;
  /** Indicative time, e.g. "0–6 mois". */
  duration: Localized;
}
