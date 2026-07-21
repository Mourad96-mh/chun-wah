import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

/**
 * Optional illustration that supplements the /parcours timeline — a single drawn
 * roadmap the client can upload. Modelled as a singleton (one document, keyed
 * 'main'): there is exactly one illustration for the whole academy.
 *
 * `imageUrl` is the drawing shown on the page; `fileUrl` an optional downloadable
 * version (a PDF or higher-resolution export). `published` gates it so nothing
 * shows until the client is ready.
 */
const RoadmapSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    imageUrl: { type: String, default: '', trim: true },
    /** Alt text — accessibility and SEO for the drawing. */
    imageAlt: { type: String, default: '', trim: true, maxlength: 300 },
    /** Optional downloadable file (PDF / hi-res image). */
    fileUrl: { type: String, default: '', trim: true },
    /** Optional caption shown under the drawing. */
    note: { type: String, default: '', trim: true, maxlength: 600 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type RoadmapDoc = InferSchemaType<typeof RoadmapSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Roadmap = models.Roadmap || model('Roadmap', RoadmapSchema);
