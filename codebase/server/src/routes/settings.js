import { Router } from 'express';
import auth from '../middleware/auth.js';
import Settings from '../models/Settings.js';
import { isNavKey } from '../lib/nav.js';

const router = Router();

// GET /api/settings — réglages PUBLICS lus par le header (chaque page). Source du
// snapshot statique (src/lib/settings.data.json) baké par scripts/sync-content.mjs.
// Défaut sûr si aucun document : tous les liens visibles (hiddenNav vide).
router.get('/', async (req, res, next) => {
  try {
    const doc = await Settings.findOne({ key: 'main' }).select('hiddenNav').lean();
    const hiddenNav = (doc?.hiddenNav ?? []).filter(isNavKey);
    res.json({ hiddenNav });
  } catch (e) {
    next(e);
  }
});

// PUT /api/settings — mettre à jour les liens masqués (protégé).
router.put('/', auth, async (req, res, next) => {
  try {
    const raw = Array.isArray(req.body?.hiddenNav) ? req.body.hiddenNav : [];
    // Ne jamais faire confiance au blob client : on ne garde que les clés
    // reconnues, dédupliquées.
    const hiddenNav = [...new Set(raw)].filter(isNavKey);

    const doc = await Settings.findOneAndUpdate(
      { key: 'main' },
      { key: 'main', hiddenNav },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ hiddenNav: doc.hiddenNav ?? [] });
  } catch (e) {
    next(e);
  }
});

export default router;
