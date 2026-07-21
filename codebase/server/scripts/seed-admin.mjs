// Crée (ou met à jour) le compte admin unique.
// Usage : node scripts/seed-admin.mjs vous@exemple.com "MotDePasseSolide" "Votre Nom"
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';

const [, , emailArg, passwordArg, nameArg] = process.argv;

if (!emailArg || !passwordArg) {
  console.error('Usage : node scripts/seed-admin.mjs <email> <motDePasse> [nom]');
  process.exit(1);
}
if (passwordArg.length < 8) {
  console.error('Le mot de passe doit faire au moins 8 caractères.');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI manquant (server/.env).');
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();

await mongoose.connect(process.env.MONGODB_URI);
const passwordHash = await bcrypt.hash(passwordArg, 10);

const admin = await Admin.findOneAndUpdate(
  { email },
  { email, passwordHash, name: (nameArg || '').trim() },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);

console.log(`Admin prêt : ${admin.email}`);
await mongoose.disconnect();
