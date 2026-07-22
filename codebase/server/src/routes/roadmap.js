import { Router } from 'express';
import auth from '../middleware/auth.js';
import Roadmap from '../models/Roadmap.js';

const router = Router();

const EMPTY = {
  imageUrl: '',
  imageAlt: '',
  fileUrl: '',
  note: '',
  published: false,
};

// Champs exposés au frontend (jamais _id / __v / timestamps).
function shape(doc) {
  if (!doc) return { ...EMPTY };
  return {
    imageUrl: doc.imageUrl ?? '',
    imageAlt: doc.imageAlt ?? '',
    fileUrl: doc.fileUrl ?? '',
    note: doc.note ?? '',
    published: Boolean(doc.published),
  };
}

// GET /api/roadmap — parcours PUBLIC : seulement s'il est publié, sinon l'objet
// vide (la page affiche alors son état « bientôt disponible »). Source du
// snapshot statique (src/lib/roadmap.data.json) baké par sync-content.mjs.
router.get('/', async (req, res, next) => {
  try {
    const doc = await Roadmap.findOne({ key: 'main', published: true }).lean();
    res.json(shape(doc));
  } catch (e) {
    next(e);
  }
});

// GET /api/roadmap/admin — le document courant, brouillon compris (protégé).
router.get('/admin', auth, async (req, res, next) => {
  try {
    const doc = await Roadmap.findOne({ key: 'main' }).lean();
    res.json(shape(doc));
  } catch (e) {
    next(e);
  }
});

// PUT /api/roadmap — remplacer le parcours (protégé).
router.put('/', auth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const imageUrl = String(body.imageUrl ?? '').trim();
    const fileUrl = String(body.fileUrl ?? '').trim();
    const published = Boolean(body.published);

    // Publier suppose qu'il y ait *quelque chose* à montrer : l'image inline ou
    // un fichier (PDF que la page intègre / propose au téléchargement).
    if (published && !imageUrl && !fileUrl) {
      return res
        .status(400)
        .json({ error: 'Ajoutez une image ou un PDF du parcours avant de le publier.' });
    }

    const doc = await Roadmap.findOneAndUpdate(
      { key: 'main' },
      {
        key: 'main',
        imageUrl,
        imageAlt: String(body.imageAlt ?? '').trim().slice(0, 300),
        fileUrl,
        note: String(body.note ?? '').trim().slice(0, 600),
        published,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json(shape(doc));
  } catch (e) {
    next(e);
  }
});

export default router;
