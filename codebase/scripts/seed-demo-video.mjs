/**
 * Inserts a single PUBLISHED demo video so the home-page "cinématique" section
 * can be seen rendered before the client provides real footage.
 *
 *   node scripts/seed-demo-video.mjs          # add the demo video
 *   node scripts/seed-demo-video.mjs --clear  # remove it again
 *
 * The demo uses a public sample MP4 + poster. Delete it from /admin/videos (or
 * run with --clear) once real videos are in — it is tagged in the title so it
 * is obvious it is a placeholder.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import mongoose from 'mongoose';

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
    /* fall back to the real environment */
  }
}

loadEnv('.env.local');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI absent. Renseignez-le dans .env.local.');
  process.exit(1);
}

const VideoSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    videoUrl: String,
    poster: String,
    order: Number,
    status: String,
  },
  { timestamps: true },
);

const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

// Public sample assets (Google's open test bucket).
const DEMO = [
  {
    title: '[DÉMO] Démonstration technique',
    description: 'Vidéo de démonstration — à remplacer par vos propres images.',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    poster: 'https://picsum.photos/seed/chunwah1/800/450',
    order: 10,
    status: 'published',
  },
  {
    title: '[DÉMO] Ambiance de cours',
    description: 'Vidéo de démonstration — à remplacer par vos propres images.',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://picsum.photos/seed/chunwah2/800/450',
    order: 20,
    status: 'published',
  },
  {
    title: '[DÉMO] Stage & événements',
    description: 'Vidéo de démonstration — à remplacer par vos propres images.',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://picsum.photos/seed/chunwah3/800/450',
    order: 30,
    status: 'published',
  },
];

await mongoose.connect(process.env.MONGODB_URI);

if (process.argv.includes('--clear')) {
  const res = await Video.deleteMany({ title: /^\[DÉMO\]/ });
  console.log(`Supprimé ${res.deletedCount} vidéo(s) de démo.`);
} else {
  await Video.deleteMany({ title: /^\[DÉMO\]/ }); // idempotent re-seed
  await Video.insertMany(DEMO);
  console.log(`Ajouté ${DEMO.length} vidéo(s) de démo (publiées).`);
}

await mongoose.disconnect();
