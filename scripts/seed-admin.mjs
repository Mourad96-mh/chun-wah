/**
 * Creates (or updates the password of) an admin user.
 *
 *   node scripts/seed-admin.mjs <email> <password> [name]
 *
 * There is no public sign-up route by design — this script is the only way an
 * account comes into existence.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Minimal .env.local reader so the script needs no extra dependency.
function loadEnv(file) {
  try {
    const raw = readFileSync(resolve(process.cwd(), file), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // No .env.local — fall back to the real environment.
  }
}

loadEnv('.env.local');

const [email, password, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(' ');

if (!email || !password) {
  console.error('Usage: node scripts/seed-admin.mjs <email> <password> [name]');
  process.exit(1);
}

if (password.length < 10) {
  console.error('Mot de passe trop court : 10 caractères minimum.');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI absent. Renseignez-le dans .env.local.');
  process.exit(1);
}

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: '' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

await mongoose.connect(process.env.MONGODB_URI);

const passwordHash = await bcrypt.hash(password, 12);
const normalized = email.trim().toLowerCase();

const existing = await Admin.findOne({ email: normalized });

if (existing) {
  existing.passwordHash = passwordHash;
  if (name) existing.name = name;
  await existing.save();
  console.log(`Mot de passe mis à jour pour ${normalized}`);
} else {
  await Admin.create({ email: normalized, passwordHash, name });
  console.log(`Compte admin créé : ${normalized}`);
}

await mongoose.disconnect();
