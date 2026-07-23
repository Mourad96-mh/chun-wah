import { Router } from 'express';
import auth from '../middleware/auth.js';
import RoadmapStep from '../models/Roadmap.js';

const router = Router();

// Normalise le corps d'une requête en champs propres (création / mise à jour).
function clean(body = {}) {
  return {
    image: String(body.image ?? '').trim(),
    titleFr: String(body.titleFr ?? '').trim(),
    titleEn: String(body.titleEn ?? '').trim(),
    descriptionFr: String(body.descriptionFr ?? '').trim(),
    descriptionEn: String(body.descriptionEn ?? '').trim(),
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
    active: body.active !== false,
  };
}

// GET /api/roadmap — étapes ACTIVES, triées par ordre. Source publique du site
// et du sync de build : une étape désactivée ne fuit jamais dans le snapshot.
router.get('/', async (req, res, next) => {
  try {
    const steps = await RoadmapStep.find({ active: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json(steps);
  } catch (e) {
    next(e);
  }
});

// GET /api/roadmap/admin/all — toutes les étapes, actives ou non (protégé).
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    const steps = await RoadmapStep.find().sort({ order: 1, createdAt: 1 }).lean();
    res.json(steps);
  } catch (e) {
    next(e);
  }
});

// POST /api/roadmap — créer une étape (protégé).
router.post('/', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.image) {
      return res.status(400).json({ error: "L'image de l'étape est requise" });
    }
    const step = await RoadmapStep.create(data);
    res.status(201).json(step.toObject());
  } catch (e) {
    next(e);
  }
});

// PUT /api/roadmap/:id — mettre à jour une étape (protégé).
router.put('/:id', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.image) {
      return res.status(400).json({ error: "L'image de l'étape est requise" });
    }
    const step = await RoadmapStep.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!step) return res.status(404).json({ error: 'Étape introuvable' });
    res.json(step.toObject());
  } catch (e) {
    next(e);
  }
});

// DELETE /api/roadmap/:id — supprimer une étape (protégé).
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const step = await RoadmapStep.findByIdAndDelete(req.params.id);
    if (!step) return res.status(404).json({ error: 'Étape introuvable' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
