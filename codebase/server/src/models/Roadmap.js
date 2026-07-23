import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Étape du parcours de l'élève, affichée sur /parcours comme une frise verticale
 * (image + titre + description, bilingue). Gérée depuis /admin/parcours — même
 * patron que les bannières (une étape = un document, ordonnées par `order`).
 *
 * Note migration : l'ancien parcours était un singleton (une seule illustration
 * ou PDF). Ce modèle le remplace par une COLLECTION d'étapes ; l'ancienne
 * collection `roadmaps` (document key:'main') n'est plus lue.
 */
const RoadmapStepSchema = new Schema(
  {
    // Image de l'étape (téléversée depuis l'admin).
    image: { type: String, required: true, trim: true },
    // Titre superposé — bilingue.
    titleFr: { type: String, default: '', trim: true, maxlength: 200 },
    titleEn: { type: String, default: '', trim: true, maxlength: 200 },
    // Description de l'étape — bilingue.
    descriptionFr: { type: String, default: '', trim: true, maxlength: 1000 },
    descriptionEn: { type: String, default: '', trim: true, maxlength: 1000 },
    // Ordre d'affichage dans la frise. Plus petit = plus tôt.
    order: { type: Number, default: 0 },
    // Une étape inactive reste en base mais disparaît de la frise.
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RoadmapStepSchema.index({ order: 1, createdAt: 1 });

export default mongoose.models.RoadmapStep || model('RoadmapStep', RoadmapStepSchema);
