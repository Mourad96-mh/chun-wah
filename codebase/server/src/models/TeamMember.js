import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Membre de l'équipe (instructeurs & encadrants), affiché sur /equipe comme une
 * grille de cartes (photo + nom + rôle + bio + liens sociaux). Géré depuis
 * /admin/equipe — même patron que les bannières et les étapes du parcours.
 *
 * Remplace l'ancien roster statique data/instructors.ts pour la page publique.
 * BILINGUE pour le rôle et la bio ; le nom et les liens sociaux sont uniques.
 */
const TeamMemberSchema = new Schema(
  {
    // Nom affiché (non traduit).
    name: { type: String, required: true, trim: true, maxlength: 120 },
    // Slug stable dérivé du nom (clé d'URL / de référence).
    slug: { type: String, default: '', trim: true, index: true },
    // Rôle / grade — bilingue.
    roleFr: { type: String, default: '', trim: true, maxlength: 160 },
    roleEn: { type: String, default: '', trim: true, maxlength: 160 },
    // Biographie — bilingue.
    bioFr: { type: String, default: '', trim: true, maxlength: 1500 },
    bioEn: { type: String, default: '', trim: true, maxlength: 1500 },
    // Portrait téléversé.
    image: { type: String, default: '', trim: true },
    // Liens sociaux (facultatifs).
    facebook: { type: String, default: '', trim: true },
    instagram: { type: String, default: '', trim: true },
    youtube: { type: String, default: '', trim: true },
    tiktok: { type: String, default: '', trim: true },
    // Ordre d'affichage. Plus petit = plus tôt.
    order: { type: Number, default: 0 },
    // Un membre inactif reste en base mais disparaît de la page.
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TeamMemberSchema.index({ order: 1, createdAt: 1 });

export default mongoose.models.TeamMember || model('TeamMember', TeamMemberSchema);
