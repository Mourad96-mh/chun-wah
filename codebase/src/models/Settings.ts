import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

/**
 * Site-wide settings the client controls from the admin, modelled as a singleton
 * (one document keyed 'main', like Roadmap).
 *
 * `hiddenNav` lists the header nav keys (see lib/nav.ts) the client has chosen to
 * hide from the public menu. An empty array means every link is visible — the
 * safe default when no document exists yet.
 */
const SettingsSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    hiddenNav: { type: [String], default: [] },
  },
  { timestamps: true },
);

export type SettingsDoc = InferSchemaType<typeof SettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Settings = models.Settings || model('Settings', SettingsSchema);
