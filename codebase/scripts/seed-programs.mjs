/**
 * Migrates the five original disciplines from src/data/programs.ts into MongoDB
 * so they become editable from the admin — keeping their slugs so the weekly
 * timetable (data/schedule.ts) still resolves them.
 *
 *   node scripts/seed-programs.mjs
 *
 * Idempotent: upserts by slug, so re-running updates rather than duplicating.
 * Only the French text is stored (the site duplicates it into English).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import mongoose from 'mongoose';

function loadEnv(file) {
  try {
    const raw = readFileSync(resolve(process.cwd(), file), 'utf8');
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let value = t.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* fall back to the real environment */
  }
}

loadEnv('.env.local');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI absent. Renseignez-le dans .env.local.');
  process.exit(1);
}

// The five disciplines, French text only (mirrors src/data/programs.ts).
const programs = [
  {
    slug: 'wing-chun-adultes',
    order: 1,
    name: 'Wing Chun Adultes',
    tagline: "L'art martial de la ligne droite : efficace, direct, accessible à tous.",
    intro:
      "Le Wing Chun est un art martial chinois pensé pour la self-défense réelle : économie de mouvement, contrôle de l'axe central et réflexes développés au contact. Nos cours adultes mêlent travail technique, chi sao et mises en situation, dans une ambiance exigeante mais bienveillante. Aucun prérequis physique : chacun progresse à son rythme.",
    benefits: [
      'Self-défense applicable dès les premiers mois',
      'Condition physique et coordination',
      'Gestion du stress et de la distance',
      'Progression structurée par niveaux',
    ],
    ageRange: '16 ans et +',
    level: 'Débutant à avancé',
    duration: '1 h 30',
    imageAlt: 'Deux pratiquants de Wing Chun en exercice de chi sao',
  },
  {
    slug: 'kung-fu-enfants',
    order: 2,
    name: 'Kung-Fu Enfants',
    tagline: 'Discipline, confiance et motricité, dans un cadre ludique et sécurisé.',
    intro:
      "Nos cours enfants transmettent les bases du kung-fu à travers le jeu, les parcours et les exercices en binôme. L'accent est mis sur le respect, l'écoute et la persévérance autant que sur la technique. Les groupes sont constitués par tranche d'âge pour que chaque enfant évolue avec ses pairs.",
    benefits: [
      'Confiance en soi et gestion des conflits',
      'Motricité, équilibre et souplesse',
      'Respect des règles et du partenaire',
      'Passages de grades réguliers',
    ],
    ageRange: '6 – 12 ans',
    level: 'Tous niveaux',
    duration: '1 h',
    imageAlt: 'Groupe d’enfants en tenue de kung-fu pendant un cours',
  },
  {
    slug: 'self-defense-femmes',
    order: 3,
    name: 'Self-défense Femmes',
    tagline: 'Des réponses simples et efficaces, pensées pour la réalité du terrain.',
    intro:
      "Un cours dédié, centré sur les situations réelles : dégagements, frappes utiles, gestion de la distance et de la voix. La pédagogie est progressive et bienveillante, sans esprit de compétition, pour gagner en assurance autant qu’en technique.",
    benefits: [
      'Techniques simples et mémorisables',
      'Confiance et gestion du stress',
      'Mises en situation réalistes',
      'Cadre bienveillant, sans compétition',
    ],
    ageRange: '15 ans et +',
    level: 'Tous niveaux',
    duration: '1 h 15',
    imageAlt: 'Exercice de dégagement pendant un cours de self-défense',
  },
  {
    slug: 'sanda',
    order: 4,
    name: 'Sanda (Boxe chinoise)',
    tagline: 'La boxe pieds-poings chinoise : cardio, percussion et projections.',
    intro:
      "Le Sanda est la boxe chinoise de combat : coups de poing, coups de pied, projections et travail au sac. Nos séances développent explosivité, endurance et technique, du travail léger jusqu’à l’assaut contrôlé pour les pratiquants confirmés.",
    benefits: [
      'Cardio et explosivité',
      'Technique pieds-poings et projections',
      'Travail au sac et aux pattes d’ours',
      'Assaut contrôlé pour les confirmés',
    ],
    ageRange: '16 ans et +',
    level: 'Intermédiaire à avancé',
    duration: '1 h 30',
    imageAlt: 'Pratiquant de Sanda frappant un pao pendant un entraînement',
  },
  {
    slug: 'tai-chi',
    order: 5,
    name: 'Tai-Chi',
    tagline: 'Le mouvement lent au service de l’équilibre, du souffle et du calme.',
    intro:
      "Le Tai-Chi Chuan travaille la coordination, la respiration et l’ancrage à travers des enchaînements lents et fluides. Accessible à tout âge, il apaise le mental, entretient les articulations et développe une force souple souvent insoupçonnée.",
    benefits: [
      'Équilibre et coordination',
      'Respiration et gestion du stress',
      'Entretien articulaire en douceur',
      'Accessible à tout âge',
    ],
    ageRange: 'Tous âges',
    level: 'Tous niveaux',
    duration: '1 h',
    imageAlt: 'Groupe pratiquant un enchaînement de Tai-Chi',
  },
];

const ProgramSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    order: { type: Number, default: 100 },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    intro: { type: String, default: '' },
    benefits: { type: [String], default: [] },
    ageRange: { type: String, default: '' },
    level: { type: String, default: '' },
    duration: { type: String, default: '' },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  { timestamps: true },
);

const Program = mongoose.models.Program || mongoose.model('Program', ProgramSchema);

await mongoose.connect(process.env.MONGODB_URI);

let created = 0;
let updated = 0;
for (const p of programs) {
  const existing = await Program.findOne({ slug: p.slug });
  await Program.findOneAndUpdate(
    { slug: p.slug },
    // Publish them (they were live before); leave image empty → placeholder until
    // the client uploads one from the admin. Don't clobber an already-set image.
    {
      ...p,
      status: 'published',
      ...(existing?.image ? {} : { image: '' }),
    },
    { upsert: true, setDefaultsOnInsert: true },
  );
  if (existing) updated += 1;
  else created += 1;
}

console.log(`Cours : ${created} créé(s), ${updated} mis à jour.`);

await mongoose.disconnect();
