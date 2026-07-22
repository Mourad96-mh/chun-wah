// Liste les comptes admin existants (diagnostic de connexion).
// Lecture seule : n'affiche JAMAIS le hash du mot de passe.
//   node scripts/list-admins.mjs
import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI manquant (server/.env).');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const admins = await Admin.find({}).select('email name createdAt updatedAt').lean();

console.log(`${admins.length} compte(s) admin :`);
for (const a of admins) {
  console.log(`  - ${a.email}  | nom: ${a.name || '(vide)'}  | créé: ${a.createdAt?.toISOString() ?? '?'}`);
}
if (admins.length === 0) {
  console.log('  (aucun — lancer scripts/seed-admin.mjs)');
}

await mongoose.disconnect();
