import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

/**
 * A showcase video for the "cinématique" section on the home page.
 *
 * Self-hosted MP4 rather than a YouTube/Vimeo embed: the club keeps a clean
 * native player with no third-party branding. `videoUrl` is a direct file URL —
 * a Cloudinary `secure_url` from the admin upload, or any pasted URL/path,
 * including a genuine self-hosted `/videos/xxx.mp4` under /public.
 *
 * `poster` is the still shown before playback. It doubles as the VideoObject
 * thumbnail, so a video without a poster is rendered but emits no JSON-LD
 * (Google requires a thumbnailUrl).
 */
const VideoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    /** Optional caption shown under the player. */
    description: { type: String, default: '', trim: true, maxlength: 600 },
    /** Direct URL to the MP4/WebM file. */
    videoUrl: { type: String, required: true, trim: true },
    /** Poster / thumbnail image URL. */
    poster: { type: String, default: '', trim: true },
    /** Manual ordering on the home page; lower shows first. */
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

VideoSchema.index({ status: 1, order: 1 });

export type VideoDoc = InferSchemaType<typeof VideoSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Video = models.Video || model('Video', VideoSchema);
