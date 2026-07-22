// Supprime un compte admin par e-mail.
//   node scripts/delete-admin.mjs ancien@exemple.com
//
// Garde-fou : refuse de supprimer le dernier compte, sinon plus personne ne peut
// se connecter à l'admin (il n'y a pas d'inscription publique).
import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';

const [, , emailArg] = process.argv;

if (!emailArg) {
  console.error('Usage : node scripts/delete-admin.mjs <email>');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI manquant (server/.env).');
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();

await mongoose.connect(process.env.MONGODB_URI);

const total = await Admin.countDocuments({});
const target = await Admin.findOne({ email }).select('email name').lean();

if (!target) {
  console.error(`Aucun compte admin avec l'e-mail ${email}.`);
  await mongoose.disconnect();
  process.exit(1);
}
if (total <= 1) {
  console.error(`Refus : ${email} est le dernier compte admin. Créez-en un autre d'abord.`);
  await mongoose.disconnect();
  process.exit(1);
}

await Admin.deleteOne({ email });
console.log(`Compte supprimé : ${email}`);
console.log(`Comptes restants : ${total - 1}`);

await mongoose.disconnect();
