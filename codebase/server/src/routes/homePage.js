import { Router } from 'express';
import auth from '../middleware/auth.js';
import HomePage from '../models/HomePage.js';

const router = Router();

const FIELDS = [
  'aboutKickerFr', 'aboutKickerEn',
  'aboutTitleFr', 'aboutTitleEn',
  'aboutBodyFr', 'aboutBodyEn',
];

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f, '']));

// Champs exposés au frontend (jamais _id / __v / timestamps / key).
function shape(doc) {
  if (!doc) return { ...EMPTY };
  const out = {};
  for (const f of FIELDS) out[f] = doc[f] ?? '';
  return out;
}

// GET /api/home-page — textes de l'accueil (public). Source du snapshot statique
// (src/lib/homePage.data.json) baké par sync-content.mjs.
router.get('/', async (req, res, next) => {
  try {
    const doc = await HomePage.findOne({ key: 'main' }).lean();
    res.json(shape(doc));
  } catch (e) {
    next(e);
  }
});

// PUT /api/home-page — remplacer les textes (protégé).
router.put('/', auth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const update = { key: 'main' };
    for (const f of FIELDS) update[f] = String(body[f] ?? '').trim();

    const doc = await HomePage.findOneAndUpdate(
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
