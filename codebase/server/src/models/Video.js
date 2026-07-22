import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Vidéo de la section « L'académie en mouvement » de la page d'accueil.
 *
 * MP4 auto-hébergé plutôt qu'un embed YouTube/Vimeo : le club garde un lecteur
 * natif sans marque tierce. `videoUrl` est une URL de fichier directe — un
 * `secure_url` Cloudinary venu de l'upload admin, ou n'importe quelle URL/chemin
 * collé, y compris un vrai `/videos/xxx.mp4` auto-hébergé.
 *
 * `poster` est l'image affichée avant lecture. Elle sert aussi de vignette
 * VideoObject : une vidéo sans poster s'affiche mais n'émet pas de JSON-LD
 * (Google exige un thumbnailUrl).
 */
const VideoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    /** Légende facultative affichée sous le lecteur. */
    description: { type: String, default: '', trim: true, maxlength: 600 },
    /** URL directe du fichier MP4/WebM. */
    videoUrl: { type: String, required: true, trim: true },
    /** URL de l'image d'aperçu / vignette. */
    poster: { type: String, default: '', trim: true },
    /** Ordre manuel sur la page d'accueil ; le plus petit passe en premier. */
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

VideoSchema.index({ status: 1, order: 1 });

export default mongoose.models.Video || model('Video', VideoSchema);
