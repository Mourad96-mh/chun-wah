import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = Router();

// POST /api/auth/login → { token, email, name }
router.post('/login', async (req, res, next) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password || '';
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail et mot de passe requis.' });
    }

    const admin = await Admin.findOne({ email });
    // Même travail et même message dans les deux cas → la réponse ne révèle pas
    // si l'adresse existe.
    const hash =
      admin?.passwordHash ??
      '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvaliduu';
    const ok = await bcrypt.compare(password, hash);

    if (!admin || !ok) {
      return res.status(401).json({ error: 'E-mail ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { sub: String(admin._id), email: admin.email, name: admin.name || '' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    admin.lastLoginAt = new Date();
    await admin.save();

    res.json({ token, email: admin.email, name: admin.name || '' });
  } catch (e) {
    next(e);
  }
});

export default router;
