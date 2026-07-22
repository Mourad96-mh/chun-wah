import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Discipline / cours. Contenu stocké en français ; le site public le duplique
 * en anglais (EN retombe sur FR) via src/lib/programs.ts. Les slugs sont
 * conservés car l'horaire hebdomadaire (data/schedule.ts) les résout.
 */
const ProgramSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    /** Position dans le menu / la grille ; plus petit = affiché en premier. */
    order: { type: Number, default: 100 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    /** Une ligne, utilisée sur les cartes et en meta description. */
    tagline: { type: String, default: '', trim: true, maxlength: 300 },
    /** Paragraphe d'intro complet sur la page du cours. */
    intro: { type: String, default: '', trim: true, maxlength: 3000 },
    /** Puces : ce que l'élève en retire. */
    benefits: { type: [String], default: [] },
    ageRange: { type: String, default: '', trim: true, maxlength: 80 },
    level: { type: String, default: '', trim: true, maxlength: 80 },
    duration: { type: String, default: '', trim: true, maxlength: 80 },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '', trim: true, maxlength: 300 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true }
);

ProgramSchema.index({ status: 1, order: 1 });

export default mongoose.models.Program || model('Program', ProgramSchema);
