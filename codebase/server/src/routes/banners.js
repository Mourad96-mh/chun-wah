import { Router } from 'express';
import auth from '../middleware/auth.js';
import Banner from '../models/Banner.js';

const router = Router();

// Normalise le corps d'une requête en champs propres (création / mise à jour).
function clean(body = {}) {
  return {
    image: String(body.image ?? '').trim(),
    imageMobile: String(body.imageMobile ?? '').trim(),
    titleFr: String(body.titleFr ?? '').trim(),
    titleEn: String(body.titleEn ?? '').trim(),
    subtitleFr: String(body.subtitleFr ?? '').trim(),
    subtitleEn: String(body.subtitleEn ?? '').trim(),
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
    active: body.active !== false,
  };
}

// GET /api/banners — diapositives ACTIVES, triées par ordre. C'est ce que
// consomment le site et le sync de build : une diapositive désactivée ne fuit
// jamais dans le snapshot statique.
router.get('/', async (req, res, next) => {
  try {
    const banners = await Banner.find({ active: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json(banners);
  } catch (e) {
    next(e);
  }
});

// GET /api/banners/admin/all — toutes les diapositives, actives ou non (protégé).
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 }).lean();
    res.json(banners);
  } catch (e) {
    next(e);
  }
});

// POST /api/banners — créer (protégé).
router.post('/', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.image) {
      return res.status(400).json({ error: "L'image de la diapositive est requise" });
    }
    const banner = await Banner.create(data);
    res.status(201).json(banner.toObject());
  } catch (e) {
    next(e);
  }
});

// PUT /api/banners/:id — mettre à jour (protégé).
router.put('/:id', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.image) {
      return res.status(400).json({ error: "L'image de la diapositive est requise" });
    }
    const banner = await Banner.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!banner) return res.status(404).json({ error: 'Diapositive introuvable' });
    res.json(banner.toObject());
  } catch (e) {
    next(e);
  }
});

// DELETE /api/banners/:id — supprimer (protégé).
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Diapositive introuvable' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
