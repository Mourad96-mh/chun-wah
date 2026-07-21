import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

/**
 * Client-managed images for the otherwise-static vitrine (hero, "à propos",
 * instructor portraits). Modelled as a singleton (one document keyed 'main')
 * holding one entry per slot; a slot with no URL falls back to the built-in
 * "Photo à fournir" placeholder on the site.
 */
const MediaItemSchema = new Schema(
  {
    /** Stable slot key — see lib/media.ts MEDIA_SLOTS (e.g. 'hero', 'instructor:<slug>'). */
    slot: { type: String, required: true },
    url: { type: String, default: '', trim: true },
    /** Optional alt text; blank falls back to the copy already in the page. */
    alt: { type: String, default: '', trim: true, maxlength: 300 },
    /** Display name override (instructor slots only); blank keeps the default. */
    name: { type: String, default: '', trim: true, maxlength: 120 },
  },
  { _id: false },
);

const MediaSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    items: { type: [MediaItemSchema], default: [] },
  },
  { timestamps: true },
);

export type MediaDoc = InferSchemaType<typeof MediaSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Media = models.Media || model('Media', MediaSchema);
