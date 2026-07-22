import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Illustration du parcours de l'élève affichée sur /parcours, modélisée en
 * singleton (un document `key: 'main'`, comme Settings et Media) : il n'y a
 * qu'un seul schéma de parcours pour toute l'académie.
 *
 * `imageUrl` est le dessin affiché sur la page ; `fileUrl` une version
 * téléchargeable facultative (PDF ou export haute résolution). `published`
 * garde le tout invisible tant que le client n'est pas prêt.
 */
const RoadmapSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    imageUrl: { type: String, default: '', trim: true },
    /** Texte alternatif — accessibilité et SEO du dessin. */
    imageAlt: { type: String, default: '', trim: true, maxlength: 300 },
    /** Fichier téléchargeable facultatif (PDF / image haute résolution). */
    fileUrl: { type: String, default: '', trim: true },
    /** Légende facultative affichée sous le dessin. */
    note: { type: String, default: '', trim: true, maxlength: 600 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Roadmap || model('Roadmap', RoadmapSchema);
