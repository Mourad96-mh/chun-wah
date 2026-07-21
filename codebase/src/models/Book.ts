import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

/**
 * A recommended book. Curated list only — no affiliate links, no per-book
 * pages. If the client later wants affiliate links, add a `url` field AND a
 * visible affiliate disclosure on the books page (legally required).
 */
const BookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 160 },
    /** Why the club recommends it — the whole point of the page. */
    recommendation: { type: String, required: true, trim: true, maxlength: 1200 },
    coverImage: { type: String, default: '' },
    /** Free text: "Débutant", "Tous niveaux", … */
    level: { type: String, default: '', trim: true, maxlength: 80 },
    /** Optional theme grouping, e.g. "Wing Chun", "Philosophie". */
    category: { type: String, default: '', trim: true, maxlength: 80 },
    /** Manual ordering on the page; lower shows first. */
    order: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true },
);

BookSchema.index({ status: 1, order: 1 });

export type BookDoc = InferSchemaType<typeof BookSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Book = models.Book || model('Book', BookSchema);
