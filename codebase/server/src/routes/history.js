import { Router } from 'express';
import auth from '../middleware/auth.js';
import Milestone from '../models/Milestone.js';

const router = Router();

function clean(body = {}) {
  return {
    year: String(body.year ?? '').trim(),
    titleFr: String(body.titleFr ?? '').trim(),
    titleEn: String(body.titleEn ?? '').trim(),
    descriptionFr: String(body.descriptionFr ?? '').trim(),
    descriptionEn: String(body.descriptionEn ?? '').trim(),
    image: String(body.image ?? '').trim(),
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
    active: body.active !== false,
  };
}

// GET /api/history — jalons ACTIFS, triés par ordre. Source publique + sync.
router.get('/', async (req, res, next) => {
  try {
    const milestones = await Milestone.find({ active: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json(milestones);
  } catch (e) {
    next(e);
  }
});

// GET /api/history/admin/all — tous les jalons, actifs ou non (protégé).
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    const milestones = await Milestone.find().sort({ order: 1, createdAt: 1 }).lean();
    res.json(milestones);
  } catch (e) {
    next(e);
  }
});

// POST /api/history — créer (protégé).
router.post('/', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.year) return res.status(400).json({ error: "L'année / l'étiquette est requise" });
    const milestone = await Milestone.create(data);
    res.status(201).json(milestone.toObject());
  } catch (e) {
    next(e);
  }
});

// PUT /api/history/:id — mettre à jour (protégé).
router.put('/:id', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.year) return res.status(400).json({ error: "L'année / l'étiquette est requise" });
    const milestone = await Milestone.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!milestone) return res.status(404).json({ error: 'Jalon introuvable' });
    res.json(milestone.toObject());
  } catch (e) {
    next(e);
  }
});

// DELETE /api/history/:id — supprimer (protégé).
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const milestone = await Milestone.findByIdAndDelete(req.params.id);
    if (!milestone) return res.status(404).json({ error: 'Jalon introuvable' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
