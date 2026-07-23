import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Événement de l'académie (stage, compétition, passage de grade, séminaire),
 * affiché sur /evenements comme une liste de cartes datées. Géré depuis
 * /admin/evenements — même patron que les bannières.
 *
 * Les dates sont stockées en chaînes 'YYYY-MM-DD' (et l'heure en 'HH:MM') : pas
 * d'ambiguïté de fuseau horaire dans un site statique, et compatible avec les
 * champs <input type="date/time"> de l'admin. BILINGUE pour le titre et la
 * description.
 */
const EventSchema = new Schema(
  {
    // Image de couverture téléversée.
    image: { type: String, default: '', trim: true },
    // Titre — bilingue.
    titleFr: { type: String, default: '', trim: true, maxlength: 200 },
    titleEn: { type: String, default: '', trim: true, maxlength: 200 },
    // Description — bilingue.
    descriptionFr: { type: String, default: '', trim: true, maxlength: 1500 },
    descriptionEn: { type: String, default: '', trim: true, maxlength: 1500 },
    // Date de début (obligatoire) et de fin (facultative), 'YYYY-MM-DD'.
    date: { type: String, default: '', trim: true },
    endDate: { type: String, default: '', trim: true },
    // Heure de début, 'HH:MM' (facultative).
    time: { type: String, default: '', trim: true },
    // Lieu / adresse affiché sur la carte.
    location: { type: String, default: '', trim: true, maxlength: 200 },
    // Un événement inactif reste en base mais disparaît de la page.
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Tri principal par date de début.
EventSchema.index({ date: 1, time: 1 });

export default mongoose.models.Event || model('Event', EventSchema);
