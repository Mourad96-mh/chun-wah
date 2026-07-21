import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

/**
 * Admin user. Created only by `npm run seed:admin` — there is deliberately no
 * public sign-up route.
 */
const AdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    /** bcrypt hash — never the plain password. */
    passwordHash: { type: String, required: true },
    name: { type: String, default: '', trim: true, maxlength: 120 },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type AdminDoc = InferSchemaType<typeof AdminSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Admin = models.Admin || model('Admin', AdminSchema);
