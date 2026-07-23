import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Jalon de la frise chronologique « Notre histoire » (section de la page
 * d'accueil) : une étape datée de l'histoire de l'académie. Géré depuis
 * /admin/histoire — même patron que les bannières et l'équipe.
 *
 * `year` est une étiquette libre (« Ouverture », « 2020 », « Aujourd'hui ») :
 * l'ordre d'affichage est donné par `order`, pas par un tri de dates, pour
 * autoriser des étiquettes non numériques. BILINGUE pour le titre et la description.
 */
const MilestoneSchema = new Schema(
  {
    // Étiquette d'année / d'étape (« Ouverture », « 2020 », « Aujourd'hui »).
    year: { type: String, required: true, trim: true, maxlength: 40 },
    // Titre du jalon — bilingue.
    titleFr: { type: String, default: '', trim: true, maxlength: 200 },
    titleEn: { type: String, default: '', trim: true, maxlength: 200 },
    // Description — bilingue.
    descriptionFr: { type: String, default: '', trim: true, maxlength: 1500 },
    descriptionEn: { type: String, default: '', trim: true, maxlength: 1500 },
    // Image illustrative (facultative).
    image: { type: String, default: '', trim: true },
    // Ordre d'affichage dans la frise. Plus petit = plus tôt (haut de l'arbre).
    order: { type: Number, default: 0 },
    // Un jalon inactif reste en base mais disparaît de la frise.
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MilestoneSchema.index({ order: 1, createdAt: 1 });

export default mongoose.models.Milestone || model('Milestone', MilestoneSchema);
