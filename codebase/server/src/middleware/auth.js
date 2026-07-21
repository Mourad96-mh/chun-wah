import jwt from 'jsonwebtoken';

// Protège les routes en écriture : exige un JWT « Bearer » valide.
// (Dans l'ancien monolithe Next, la session était un cookie httpOnly ; en
// architecture split le front est statique sur Hostinger et appelle l'API en
// cross-origin, donc on passe le token en en-tête Authorization.)
export default function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non autorisé' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }
}
