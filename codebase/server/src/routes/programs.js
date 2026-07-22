import { Router } from 'express';
import auth from '../middleware/auth.js';
import Program from '../models/Program.js';
import { uniqueSlug } from '../lib/slug.js';

const router = Router();

// Sérialise un document Mongo : _id → id, sans __v.
function fromDb(doc) {
  const { _id, __v, ...rest } = doc;
  return { id: String(_id), ...rest };
}

// Textarea (un bénéfice par ligne) OU tableau → string[] propre.
function parseBenefits(input) {
  if (Array.isArray(input)) return input.map((b) => String(b).trim()).filter(Boolean);
  return String(input ?? '')
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean);
}

// GET /api/programs — cours PUBLIÉS, ordre croissant. Source du snapshot statique
// (src/lib/programs.data.json) baké par scripts/sync-content.mjs.
router.get('/', async (req, res, next) => {
  try {
    const programs = await Program.find({ status: 'published' })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json(programs.map(fromDb));
  } catch (e) {
    next(e);
  }
});

// GET /api/programs/admin/all — tous les cours, brouillons compris (protégé).
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    const programs = await Program.find({}).sort({ order: 1, createdAt: 1 }).lean();
    res.json(programs.map(fromDb));
  } catch (e) {
    next(e);
  }
});

// GET /api/programs/admin/:id — un cours par id (protégé).
router.get('/admin/:id', auth, async (req, res, next) => {
  try {
    const doc = await Program.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Cours introuvable.' });
    res.json(fromDb(doc));
  } catch (e) {
    next(e);
  }
});

// POST /api/programs — créer (protégé).
router.post('/', auth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = String(body.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'Le nom du cours est obligatoire.' });

    const doc = await Program.create({
      slug: await uniqueSlug(Program, String(body.slug || name)),
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 100,
      name,
      tagline: String(body.tagline ?? '').trim(),
      intro: String(body.intro ?? '').trim(),
      benefits: parseBenefits(body.benefits),
      ageRange: String(body.ageRange ?? '').trim(),
      level: String(body.level ?? '').trim(),
      duration: String(body.duration ?? '').trim(),
      image: String(body.image ?? '').trim(),
      imageAlt: String(body.imageAlt ?? '').trim(),
      status: body.status === 'published' ? 'published' : 'draft',
    });

    res.status(201).json(fromDb(doc.toObject()));
  } catch (e) {
    next(e);
  }
});

// PUT /api/programs/:id — mettre à jour (protégé).
router.put('/:id', auth, async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ error: 'Cours introuvable.' });

    const body = req.body || {};
    if (body.name !== undefined) program.name = String(body.name).trim();
    if (body.slug !== undefined) {
      program.slug = await uniqueSlug(Program, String(body.slug || program.name), req.params.id);
    }
    if (body.tagline !== undefined) program.tagline = String(body.tagline).trim();
    if (body.intro !== undefined) program.intro = String(body.intro).trim();
    if (body.benefits !== undefined) program.benefits = parseBenefits(body.benefits);
    if (body.ageRange !== undefined) program.ageRange = String(body.ageRange).trim();
    if (body.level !== undefined) program.level = String(body.level).trim();
    if (body.duration !== undefined) program.duration = String(body.duration).trim();
    if (body.image !== undefined) program.image = String(body.image).trim();
    if (body.imageAlt !== undefined) program.imageAlt = String(body.imageAlt).trim();
    if (body.order !== undefined && Number.isFinite(Number(body.order))) {
      program.order = Number(body.order);
    }
    if (body.status !== undefined) {
      program.status = body.status === 'published' ? 'published' : 'draft';
    }

    if (!program.name) return res.status(400).json({ error: 'Le nom du cours est obligatoire.' });

    await program.save();
    res.json(fromDb(program.toObject()));
  } catch (e) {
    next(e);
  }
});

// DELETE /api/programs/:id — supprimer (protégé).
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ error: 'Cours introuvable.' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
