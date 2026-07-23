import { Router } from 'express';
import auth from '../middleware/auth.js';
import Event from '../models/Event.js';

const router = Router();

function clean(body = {}) {
  return {
    image: String(body.image ?? '').trim(),
    titleFr: String(body.titleFr ?? '').trim(),
    titleEn: String(body.titleEn ?? '').trim(),
    descriptionFr: String(body.descriptionFr ?? '').trim(),
    descriptionEn: String(body.descriptionEn ?? '').trim(),
    date: String(body.date ?? '').trim(),
    endDate: String(body.endDate ?? '').trim(),
    time: String(body.time ?? '').trim(),
    location: String(body.location ?? '').trim(),
    active: body.active !== false,
  };
}

// GET /api/events — événements ACTIFS, triés par date. Source publique + sync.
router.get('/', async (req, res, next) => {
  try {
    const events = await Event.find({ active: true })
      .sort({ date: 1, time: 1 })
      .lean();
    res.json(events);
  } catch (e) {
    next(e);
  }
});

// GET /api/events/admin/all — tous les événements, actifs ou non (protégé).
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1, time: 1 }).lean();
    res.json(events);
  } catch (e) {
    next(e);
  }
});

// POST /api/events — créer (protégé).
router.post('/', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.date) return res.status(400).json({ error: "La date de l'événement est requise" });
    if (!data.titleFr && !data.titleEn) {
      return res.status(400).json({ error: 'Un titre est requis' });
    }
    const event = await Event.create(data);
    res.status(201).json(event.toObject());
  } catch (e) {
    next(e);
  }
});

// PUT /api/events/:id — mettre à jour (protégé).
router.put('/:id', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.date) return res.status(400).json({ error: "La date de l'événement est requise" });
    if (!data.titleFr && !data.titleEn) {
      return res.status(400).json({ error: 'Un titre est requis' });
    }
    const event = await Event.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ error: 'Événement introuvable' });
    res.json(event.toObject());
  } catch (e) {
    next(e);
  }
});

// DELETE /api/events/:id — supprimer (protégé).
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Événement introuvable' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
