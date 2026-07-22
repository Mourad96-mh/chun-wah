import { Router } from 'express';
import auth from '../middleware/auth.js';
import Media from '../models/Media.js';

const router = Router();

// Emplacements valides sans connaître le roster : les deux fixes + le motif
// instructor:<slug>. (Le frontend n'envoie que des slots connus ; ceci est la
// défense côté serveur.)
function isMediaSlot(slot) {
  return slot === 'hero' || slot === 'academy' || /^instructor:[a-z0-9-]+$/.test(slot);
}

// GET /api/media — images PUBLIQUES lues par le site (hero, à propos, portraits).
// Source du snapshot statique (src/lib/media.data.json) baké par sync-content.
router.get('/', async (req, res, next) => {
  try {
    const doc = await Media.findOne({ key: 'main' }).select('items').lean();
    const items = (doc?.items ?? []).filter((it) => isMediaSlot(String(it.slot)));
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

// PUT /api/media — remplace la carte d'images en bloc (protégé).
router.put('/', auth, async (req, res, next) => {
  try {
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    // Ne jamais faire confiance au blob client : slots connus, un par slot.
    const seen = new Set();
    const items = rawItems
      .map((it) => (it && typeof it === 'object' ? it : {}))
      .filter((it) => {
        const slot = String(it.slot);
        if (!isMediaSlot(slot) || seen.has(slot)) return false;
        seen.add(slot);
        return true;
      })
      .map((it) => ({
        slot: String(it.slot),
        url: String(it.url ?? '').trim(),
        alt: String(it.alt ?? '').trim().slice(0, 300),
        name: String(it.name ?? '').trim().slice(0, 120),
      }));

    const doc = await Media.findOneAndUpdate(
      { key: 'main' },
      { key: 'main', items },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ items: doc.items ?? [] });
  } catch (e) {
    next(e);
  }
});

export default router;
