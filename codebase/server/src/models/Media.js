import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Images pilotées par le client pour la vitrine (hero, « à propos », portraits
 * d'instructeurs). Singleton (un document `key: 'main'`) portant une entrée par
 * emplacement ; un emplacement sans URL retombe sur le cadre « Photo à fournir ».
 */
const MediaItemSchema = new Schema(
  {
    /** Clé d'emplacement stable — voir src/lib/media.ts (ex. 'hero', 'instructor:<slug>'). */
    slot: { type: String, required: true },
    url: { type: String, default: '', trim: true },
    alt: { type: String, default: '', trim: true, maxlength: 300 },
    /** Nom d'affichage (emplacements instructeur uniquement) ; vide = défaut. */
    name: { type: String, default: '', trim: true, maxlength: 120 },
  },
  { _id: false }
);

const MediaSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    items: { type: [MediaItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Media || model('Media', MediaSchema);
