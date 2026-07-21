import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Livre recommandé. Liste curatée — pas de liens affiliés, pas de page par livre.
 * Si le client veut plus tard des liens affiliés, ajouter un champ `url` ET une
 * mention d'affiliation visible sur la page (obligatoire légalement).
 */
const BookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 160 },
    /** Pourquoi le club le recommande — tout l'intérêt de la page. */
    recommendation: { type: String, required: true, trim: true, maxlength: 1200 },
    coverImage: { type: String, default: '' },
    /** Texte libre : "Débutant", "Tous niveaux", … */
    level: { type: String, default: '', trim: true, maxlength: 80 },
    /** Regroupement thématique optionnel, ex. "Wing Chun", "Philosophie". */
    category: { type: String, default: '', trim: true, maxlength: 80 },
    /** Ordre manuel sur la page ; plus petit = affiché en premier. */
    order: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true }
);

BookSchema.index({ status: 1, order: 1 });

export default mongoose.models.Book || model('Book', BookSchema);
