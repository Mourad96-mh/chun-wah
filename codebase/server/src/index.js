import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import bookRoutes from './routes/books.js';
import programRoutes from './routes/programs.js';
import settingsRoutes from './routes/settings.js';
import mediaRoutes from './routes/media.js';
import uploadRoutes from './routes/uploads.js';

const app = express();
app.use(express.json({ limit: '2mb' }));

// Origines autorisées à appeler l'API (le site sur Hostinger + le dev local).
const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));

app.get('/', (req, res) => res.json({ ok: true, service: 'chunwah-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/uploads', uploadRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
// Gestionnaire d'erreurs centralisé
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ error: err.message || 'Erreur serveur' });
});

const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connecté');
    app.listen(PORT, () => console.log(`API Chun Wah démarrée sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error('Erreur de connexion MongoDB :', err.message);
    process.exit(1);
  });
