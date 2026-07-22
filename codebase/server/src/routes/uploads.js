import { Router } from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import cloudinary, { CLOUDINARY_CONFIGURED } from '../config/cloudinary.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// Dossiers Cloudinary autorisés ; toute autre valeur retombe sur "blog".
const ALLOWED_FOLDERS = ['chunwah/blog', 'chunwah/livres', 'chunwah/cours', 'chunwah/medias'];

// POST /api/uploads — form-data avec un champ `file` et un champ optionnel
// `folder` (protégé). Renvoie { url }.
// Si Cloudinary n'est pas configuré, renvoie 501 → l'admin colle une URL.
router.post('/', auth, upload.single('file'), async (req, res, next) => {
  if (!CLOUDINARY_CONFIGURED) {
    return res
      .status(501)
      .json({ error: "Cloudinary non configuré — collez une URL d'image à la place." });
  }
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier.' });
    const folder = ALLOWED_FOLDERS.includes(req.body && req.body.folder)
      ? req.body.folder
      : 'chunwah/blog';
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'image',
    });
    res.json({ url: result.secure_url });
  } catch (e) {
    next(e);
  }
});

// Formats acceptés pour un document téléversable (parcours : PDF de préférence).
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

// POST /api/uploads/doc — même contrat que ci-dessus, mais pour un document
// (PDF surtout) : resource_type 'auto' pour que Cloudinary accepte le PDF en
// plus des images. Utilisé par le champ fichier du parcours.
router.post('/doc', auth, upload.single('file'), async (req, res, next) => {
  if (!CLOUDINARY_CONFIGURED) {
    return res
      .status(501)
      .json({ error: "Cloudinary non configuré — collez une URL à la place." });
  }
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier.' });
    if (!ALLOWED_DOC_TYPES.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ error: 'Format non supporté. Utilisez PDF, JPG, PNG ou WebP.' });
    }
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'chunwah/roadmap',
      resource_type: 'auto',
    });
    res.json({ url: result.secure_url });
  } catch (e) {
    next(e);
  }
});

export default router;
