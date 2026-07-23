import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Diapositive du carrousel hero de la page d'accueil, gérée depuis
 * /admin/bannieres. Le site statique lit un snapshot (src/lib/banners.data.json)
 * baké au build par scripts/sync-content.mjs, puis le rafraîchit en direct depuis
 * l'API dans le navigateur.
 *
 * Le texte est BILINGUE (le site a une version FR et une version EN) : chaque
 * champ a sa variante fr/en. Pas de bouton ni de lien par diapositive — les
 * boutons du hero (Essai gratuit / Horaires) sont fixes et traduits par le site.
 */
const BannerSchema = new Schema(
  {
    // Image de fond large (~1920×1080) affichée sur desktop.
    image: { type: String, required: true, trim: true },
    // Image optionnelle pour mobile (format plus carré) ; à défaut, l'image desktop.
    imageMobile: { type: String, default: '', trim: true },
    // Titre superposé — rendu en HTML par le site (pas gravé dans l'image).
    titleFr: { type: String, default: '', trim: true, maxlength: 200 },
    titleEn: { type: String, default: '', trim: true, maxlength: 200 },
    // Description sous le titre.
    subtitleFr: { type: String, default: '', trim: true, maxlength: 500 },
    subtitleEn: { type: String, default: '', trim: true, maxlength: 500 },
    // Ordre d'affichage. Plus petit = plus tôt.
    order: { type: Number, default: 0 },
    // Une diapositive inactive reste en base mais disparaît du carrousel.
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BannerSchema.index({ order: 1, createdAt: 1 });

export default mongoose.models.Banner || model('Banner', BannerSchema);
