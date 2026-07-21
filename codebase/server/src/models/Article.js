import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Article de blog. Français uniquement — voir le README pour le pourquoi du
 * blog mono-langue. Le corps est en Markdown, rendu et assaini au moment de
 * l'affichage (renderMarkdown).
 */
const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    /** Court résumé utilisé sur les cartes et comme meta description. */
    excerpt: { type: String, required: true, trim: true, maxlength: 320 },
    body: { type: String, required: true },
    coverImage: { type: String, default: '' },
    coverAlt: { type: String, default: '', maxlength: 200 },
    tags: { type: [String], default: [] },
    author: { type: String, default: '', trim: true, maxlength: 120 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    /** Fixé la première fois que l'article est publié ; pilote le tri. */
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Tri de l'index du blog : les plus récents publiés d'abord.
ArticleSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.models.Article || model('Article', ArticleSchema);
