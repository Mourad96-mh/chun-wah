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

// POST /api/uploads/sign — upload direct signé, pour la vidéo (protégé).
//
// Les images passent par ce serveur (quelques Mo, sans risque) ; une vidéo peut
// peser 100 Mo — la faire transiter par Render serait lent et gourmand en
// mémoire. Le navigateur l'envoie donc directement à Cloudinary : cette route
// ne rend qu'une signature courte, l'api_secret ne quitte jamais le serveur.
router.post('/sign', auth, (req, res) => {
  if (!CLOUDINARY_CONFIGURED) {
    return res.status(501).json({
      error:
        "L'upload vidéo n'est pas configuré (clés Cloudinary absentes). Collez l'URL d'une vidéo à la place.",
    });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'chunwah/videos';
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

export default router;
