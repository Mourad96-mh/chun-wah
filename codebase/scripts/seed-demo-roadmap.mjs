/**
 * Seeds a published DEMO roadmap so /parcours can be seen before the client
 * uploads their own drawing/PDF. The roadmap is a singleton (one document keyed
 * 'main'); this points it at the bundled kung-fu illustration in /public.
 *
 *   node scripts/seed-demo-roadmap.mjs          # publish the demo illustration
 *   node scripts/seed-demo-roadmap.mjs --clear  # unpublish + wipe roadmap docs
 *
 * The caption is tagged "[DÉMO]" so it is obviously a placeholder on the page.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import mongoose from 'mongoose';

function loadEnv(file) {
  try {
    const raw = readFileSync(resolve(process.cwd(), file), 'utf8');
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let value = t.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* use the real environment */
  }
}

loadEnv('.env.local');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI absent. Renseignez-le dans .env.local.');
  process.exit(1);
}

// Singleton schema — mirrors src/models/Roadmap.ts.
const RoadmapSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    imageUrl: String,
    imageAlt: String,
    fileUrl: String,
    note: String,
    published: Boolean,
  },
  { timestamps: true },
);
const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);

await mongoose.connect(process.env.MONGODB_URI);

// Remove any leftover documents from the old card design (they have no `key`),
// so the collection holds only the singleton.
await Roadmap.deleteMany({ key: { $ne: 'main' } });

if (process.argv.includes('--clear')) {
  await Roadmap.deleteOne({ key: 'main' });
  console.log('Parcours réinitialisé (aucune illustration publiée).');
} else {
  await Roadmap.findOneAndUpdate(
    { key: 'main' },
    {
      key: 'main',
      imageUrl: '/roadmap-demo-kungfu.svg',
      imageAlt:
        'Parcours de progression en kung-fu : du débutant (ceinture blanche) à la maîtrise (ceinture noire), en cinq étapes le long d’un chemin de montagne.',
      fileUrl: '',
      note: '[DÉMO] Exemple de parcours de progression — remplacez cette illustration par votre propre schéma (image ou PDF) depuis le tableau de bord.',
      published: true,
    },
    { upsert: true, setDefaultsOnInsert: true },
  );
  console.log('Illustration de démo publiée sur /parcours (kung-fu, 5 étapes).');
}

await mongoose.disconnect();
