import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

/**
 * A discipline / course. Content is stored in French; the public site duplicates
 * it into English (EN falls back to FR) via lib/programs.ts, matching how the
 * Blog and Books work. The five original disciplines are migrated in by
 * scripts/seed-programs.mjs, keeping their slugs so the weekly timetable
 * (data/schedule.ts) still resolves them.
 */
const ProgramSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    /** Position in the nav / grid; lower shows first. */
    order: { type: Number, default: 100 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    /** One line, used on cards and in meta descriptions. */
    tagline: { type: String, default: '', trim: true, maxlength: 300 },
    /** Full intro paragraph on the course page. */
    intro: { type: String, default: '', trim: true, maxlength: 3000 },
    /** Bullet points: what the student gets out of it. */
    benefits: { type: [String], default: [] },
    ageRange: { type: String, default: '', trim: true, maxlength: 80 },
    level: { type: String, default: '', trim: true, maxlength: 80 },
    duration: { type: String, default: '', trim: true, maxlength: 80 },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '', trim: true, maxlength: 300 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true },
);

ProgramSchema.index({ status: 1, order: 1 });

export type ProgramDoc = InferSchemaType<typeof ProgramSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Program = models.Program || model('Program', ProgramSchema);
