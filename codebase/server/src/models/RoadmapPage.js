import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Textes de la page « Parcours » (chrome de la page, hors étapes) : titre,
 * intro, accroche + titre de la section, et le bloc d'appel à l'action.
 *
 * Singleton (un document `key: 'main'`, comme Settings et Media). BILINGUE :
 * chaque texte a sa variante fr/en. Un champ laissé VIDE retombe sur le texte
 * traduit par défaut du site (voir src/lib/roadmapPage.ts) — le client ne
 * remplit que ce qu'il veut personnaliser.
 */
const str = { type: String, default: '', trim: true, maxlength: 400 };

const RoadmapPageSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    // Titre + intro de l'en-tête de page (PageHeader).
    titleFr: str,
    titleEn: str,
    introFr: { ...str, maxlength: 800 },
    introEn: { ...str, maxlength: 800 },
    // Accroche (kicker) + titre de la section des étapes.
    kickerFr: str,
    kickerEn: str,
    headingFr: str,
    headingEn: str,
    // Bloc d'appel à l'action en bas de page (le lien reste /cours-essai-gratuit).
    ctaTitleFr: str,
    ctaTitleEn: str,
    ctaButtonFr: str,
    ctaButtonEn: str,
  },
  { timestamps: true }
);

export default mongoose.models.RoadmapPage || model('RoadmapPage', RoadmapPageSchema);
