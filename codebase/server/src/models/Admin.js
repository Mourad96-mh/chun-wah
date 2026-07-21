import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Compte admin. Créé uniquement par `npm run seed:admin` — il n'y a
 * délibérément aucune route d'inscription publique.
 */
const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    /** hash bcrypt — jamais le mot de passe en clair. */
    passwordHash: { type: String, required: true },
    name: { type: String, default: '', trim: true, maxlength: 120 },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || model('Admin', AdminSchema);
