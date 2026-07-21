import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

/**
 * Blog article. French only — see README for why the blog is single-locale.
 * Body is Markdown, rendered and sanitised server-side at display time.
 */
const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    /** Short summary used on cards and as the meta description. */
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
    /** Set the first time the article is published; drives ordering. */
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Sorting the blog index: newest published first.
ArticleSchema.index({ status: 1, publishedAt: -1 });

export type ArticleDoc = InferSchemaType<typeof ArticleSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Article = models.Article || model('Article', ArticleSchema);
