import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Textes libres de la page d'accueil. Pour l'instant la seule section concernée
 * est « à propos » (accroche + titre + paragraphe), mais le document est prévu
 * pour accueillir les autres blocs fixes de l'accueil au fur et à mesure.
 *
 * Singleton (un document `key: 'main'`, comme Settings, Media et RoadmapPage).
 * BILINGUE : chaque texte a sa variante fr/en. Un champ laissé VIDE retombe sur
 * la traduction par défaut du site (messages/{fr,en}.json → home.about*) — le
 * client ne remplit que ce qu'il veut personnaliser. Voir src/lib/homePage.ts.
 */
const str = { type: String, default: '', trim: true, maxlength: 400 };

const HomePageSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    // Section « à propos » de l'accueil.
    aboutKickerFr: str,
    aboutKickerEn: str,
    aboutTitleFr: str,
    aboutTitleEn: str,
    aboutBodyFr: { ...str, maxlength: 1200 },
    aboutBodyEn: { ...str, maxlength: 1200 },
  },
  { timestamps: true }
);

export default mongoose.models.HomePage || model('HomePage', HomePageSchema);
