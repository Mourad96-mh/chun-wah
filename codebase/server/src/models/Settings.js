import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Réglages du site pilotés depuis l'admin, modélisés en singleton (un document
 * `key: 'main'`, comme Roadmap).
 *
 * `hiddenNav` liste les clés de nav (voir lib/nav.js) que le client a choisi de
 * masquer du menu public. Tableau vide = tous les liens visibles (défaut sûr).
 */
const SettingsSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    hiddenNav: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || model('Settings', SettingsSchema);
