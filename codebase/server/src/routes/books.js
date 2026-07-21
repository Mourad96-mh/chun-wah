import { Router } from 'express';
import auth from '../middleware/auth.js';
import Book from '../models/Book.js';

const router = Router();

// Sérialise un document Mongo : _id → id, sans __v.
function fromDb(doc) {
  const { _id, __v, ...rest } = doc;
  return { id: String(_id), ...rest };
}

function validate(body) {
  const title = String(body.title ?? '').trim();
  const author = String(body.author ?? '').trim();
  const recommendation = String(body.recommendation ?? '').trim();
  if (!title || !author || !recommendation) {
    return { error: 'Titre, auteur et recommandation sont obligatoires.' };
  }
  return {
    title,
    author,
    recommendation,
    coverImage: String(body.coverImage ?? '').trim(),
    level: String(body.level ?? '').trim(),
    category: String(body.category ?? '').trim(),
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : 100,
    status: body.status === 'published' ? 'published' : 'draft',
  };
}

// GET /api/books — livres PUBLIÉS, ordre croissant puis plus récent d'abord.
// Source du snapshot statique baké par scripts/sync-content.mjs (page Livres).
router.get('/', async (req, res, next) => {
  try {
    const books = await Book.find({ status: 'published' })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(books.map(fromDb));
  } catch (e) {
    next(e);
  }
});

// GET /api/books/admin/all — tous les livres, brouillons compris (protégé).
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    const books = await Book.find({}).sort({ order: 1, createdAt: -1 }).lean();
    res.json(books.map(fromDb));
  } catch (e) {
    next(e);
  }
});

// GET /api/books/admin/:id — un livre par id (protégé).
router.get('/admin/:id', auth, async (req, res, next) => {
  try {
    const doc = await Book.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Livre introuvable.' });
    res.json(fromDb(doc));
  } catch (e) {
    next(e);
  }
});

// POST /api/books — créer (protégé).
router.post('/', auth, async (req, res, next) => {
  try {
    const fields = validate(req.body || {});
    if (fields.error) return res.status(400).json({ error: fields.error });
    const doc = await Book.create(fields);
    res.status(201).json(fromDb(doc.toObject()));
  } catch (e) {
    next(e);
  }
});

// PUT /api/books/:id — mettre à jour (protégé).
router.put('/:id', auth, async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Livre introuvable.' });

    const body = req.body || {};
    if (body.title !== undefined) book.title = String(body.title).trim();
    if (body.author !== undefined) book.author = String(body.author).trim();
    if (body.recommendation !== undefined) {
      book.recommendation = String(body.recommendation).trim();
    }
    if (body.coverImage !== undefined) book.coverImage = String(body.coverImage).trim();
    if (body.level !== undefined) book.level = String(body.level).trim();
    if (body.category !== undefined) book.category = String(body.category).trim();
    if (body.order !== undefined && Number.isFinite(Number(body.order))) {
      book.order = Number(body.order);
    }
    if (body.status !== undefined) {
      book.status = body.status === 'published' ? 'published' : 'draft';
    }

    if (!book.title || !book.author || !book.recommendation) {
      return res.status(400).json({ error: 'Titre, auteur et recommandation sont obligatoires.' });
    }

    await book.save();
    res.json(fromDb(book.toObject()));
  } catch (e) {
    next(e);
  }
});

// DELETE /api/books/:id — supprimer (protégé).
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Livre introuvable.' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
