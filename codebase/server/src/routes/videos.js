import { Router } from 'express';
import auth from '../middleware/auth.js';
import Video from '../models/Video.js';

const router = Router();

// Sérialise un document Mongo : _id → id, sans __v.
function fromDb(doc) {
  const { _id, __v, ...rest } = doc;
  return { id: String(_id), ...rest };
}

function validate(body) {
  const title = String(body.title ?? '').trim();
  const videoUrl = String(body.videoUrl ?? '').trim();
  if (!title || !videoUrl) {
    return { error: 'Le titre et la vidéo sont obligatoires.' };
  }
  return {
    title,
    videoUrl,
    description: String(body.description ?? '').trim(),
    poster: String(body.poster ?? '').trim(),
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : 100,
    status: body.status === 'published' ? 'published' : 'draft',
  };
}

// GET /api/videos — vidéos PUBLIÉES, ordre croissant puis plus récente d'abord.
// Source du snapshot statique baké par sync-content (section vidéos de l'accueil).
router.get('/', async (req, res, next) => {
  try {
    const videos = await Video.find({ status: 'published' })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(videos.map(fromDb));
  } catch (e) {
    next(e);
  }
});

// GET /api/videos/admin/all — toutes les vidéos, brouillons compris (protégé).
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    const videos = await Video.find({}).sort({ order: 1, createdAt: -1 }).lean();
    res.json(videos.map(fromDb));
  } catch (e) {
    next(e);
  }
});

// GET /api/videos/admin/:id — une vidéo par id (protégé).
router.get('/admin/:id', auth, async (req, res, next) => {
  try {
    const doc = await Video.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Vidéo introuvable.' });
    res.json(fromDb(doc));
  } catch (e) {
    next(e);
  }
});

// POST /api/videos — créer (protégé).
router.post('/', auth, async (req, res, next) => {
  try {
    const fields = validate(req.body || {});
    if (fields.error) return res.status(400).json({ error: fields.error });
    const doc = await Video.create(fields);
    res.status(201).json(fromDb(doc.toObject()));
  } catch (e) {
    next(e);
  }
});

// PUT /api/videos/:id — mettre à jour (protégé).
router.put('/:id', auth, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Vidéo introuvable.' });

    const body = req.body || {};
    if (body.title !== undefined) video.title = String(body.title).trim();
    if (body.description !== undefined) video.description = String(body.description).trim();
    if (body.videoUrl !== undefined) video.videoUrl = String(body.videoUrl).trim();
    if (body.poster !== undefined) video.poster = String(body.poster).trim();
    if (body.order !== undefined && Number.isFinite(Number(body.order))) {
      video.order = Number(body.order);
    }
    if (body.status !== undefined) {
      video.status = body.status === 'published' ? 'published' : 'draft';
    }

    if (!video.title || !video.videoUrl) {
      return res.status(400).json({ error: 'Le titre et la vidéo sont obligatoires.' });
    }

    await video.save();
    res.json(fromDb(video.toObject()));
  } catch (e) {
    next(e);
  }
});

// DELETE /api/videos/:id — supprimer (protégé).
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ error: 'Vidéo introuvable.' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
