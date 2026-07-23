import { Router } from 'express';
import auth from '../middleware/auth.js';
import TeamMember from '../models/TeamMember.js';
import { uniqueSlug } from '../lib/slug.js';

const router = Router();

function clean(body = {}) {
  return {
    name: String(body.name ?? '').trim(),
    roleFr: String(body.roleFr ?? '').trim(),
    roleEn: String(body.roleEn ?? '').trim(),
    bioFr: String(body.bioFr ?? '').trim(),
    bioEn: String(body.bioEn ?? '').trim(),
    image: String(body.image ?? '').trim(),
    facebook: String(body.facebook ?? '').trim(),
    instagram: String(body.instagram ?? '').trim(),
    youtube: String(body.youtube ?? '').trim(),
    tiktok: String(body.tiktok ?? '').trim(),
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
    active: body.active !== false,
  };
}

// GET /api/team — membres ACTIFS, triés par ordre. Source publique + sync de build.
router.get('/', async (req, res, next) => {
  try {
    const members = await TeamMember.find({ active: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json(members);
  } catch (e) {
    next(e);
  }
});

// GET /api/team/admin/all — tous les membres, actifs ou non (protégé).
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    const members = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean();
    res.json(members);
  } catch (e) {
    next(e);
  }
});

// POST /api/team — créer (protégé).
router.post('/', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.name) return res.status(400).json({ error: 'Le nom est requis' });
    data.slug = await uniqueSlug(TeamMember, data.name);
    const member = await TeamMember.create(data);
    res.status(201).json(member.toObject());
  } catch (e) {
    next(e);
  }
});

// PUT /api/team/:id — mettre à jour (protégé).
router.put('/:id', auth, async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.name) return res.status(400).json({ error: 'Le nom est requis' });
    data.slug = await uniqueSlug(TeamMember, data.name, req.params.id);
    const member = await TeamMember.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!member) return res.status(404).json({ error: 'Membre introuvable' });
    res.json(member.toObject());
  } catch (e) {
    next(e);
  }
});

// DELETE /api/team/:id — supprimer (protégé).
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ error: 'Membre introuvable' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
