import { Router } from 'express';
import auth from '../middleware/auth.js';
import RoadmapPage from '../models/RoadmapPage.js';

const router = Router();

const FIELDS = [
  'titleFr', 'titleEn',
  'introFr', 'introEn',
  'kickerFr', 'kickerEn',
  'headingFr', 'headingEn',
  'ctaTitleFr', 'ctaTitleEn',
  'ctaButtonFr', 'ctaButtonEn',
];

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f, '']));

// Champs exposés au frontend (jamais _id / __v / timestamps / key).
function shape(doc) {
  if (!doc) return { ...EMPTY };
  const out = {};
  for (const f of FIELDS) out[f] = doc[f] ?? '';
  return out;
}

// GET /api/roadmap-page — textes de la page Parcours (public). Source du snapshot
// statique (src/lib/roadmapPage.data.json) baké par sync-content.mjs.
router.get('/', async (req, res, next) => {
  try {
    const doc = await RoadmapPage.findOne({ key: 'main' }).lean();
    res.json(shape(doc));
  } catch (e) {
    next(e);
  }
});

// PUT /api/roadmap-page — remplacer les textes (protégé).
router.put('/', auth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const update = { key: 'main' };
    for (const f of FIELDS) update[f] = String(body[f] ?? '').trim();

    const doc = await RoadmapPage.findOneAndUpdate(
      { key: 'main' },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json(shape(doc));
  } catch (e) {
    next(e);
  }
});

export default router;
