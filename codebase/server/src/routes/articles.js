import { Router } from 'express';
import auth from '../middleware/auth.js';
import Article from '../models/Article.js';
import { uniqueSlug } from '../lib/slug.js';
import { renderMarkdown, toPlainText } from '../lib/markdown.js';

const router = Router();

// Sérialise un document Mongo en objet API : _id → id, sans __v.
function fromDb(doc) {
  const { _id, __v, ...rest } = doc;
  return { id: String(_id), ...rest };
}

// Carte d'article (liste) — sans le corps, qui est lourd.
function toCard(doc) {
  const { body, ...rest } = fromDb(doc);
  return rest;
}

// ---------------------------------------------------------------------------
// Lectures PUBLIQUES (le site statique + le snapshot de build les consomment).
// ---------------------------------------------------------------------------

// GET /api/articles — articles PUBLIÉS uniquement, plus récent d'abord.
// Renvoie le document COMPLET (corps Markdown inclus) : c'est la source que
// scripts/sync-content.mjs bake dans le snapshot statique, d'où les pages blog
// (liste ET détail) sont générées au build pour le SEO.
router.get('/', async (req, res, next) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .lean();
    res.json(articles.map(fromDb));
  } catch (e) {
    next(e);
  }
});

// ---------------------------------------------------------------------------
// ADMIN (protégé par JWT Bearer). Déclaré AVANT `/:slug` pour ne pas être
// capturé par la route slug publique.
// ---------------------------------------------------------------------------

// GET /api/articles/admin/all — tous les articles, brouillons compris (cartes).
router.get('/admin/all', auth, async (req, res, next) => {
  try {
    const articles = await Article.find({})
      .sort({ updatedAt: -1 })
      .lean();
    res.json(articles.map(toCard));
  } catch (e) {
    next(e);
  }
});

// GET /api/articles/admin/:id — un article par id, corps brut pour l'édition.
router.get('/admin/:id', auth, async (req, res, next) => {
  try {
    const doc = await Article.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Article introuvable.' });
    res.json(fromDb(doc));
  } catch (e) {
    next(e);
  }
});

// POST /api/articles — créer (protégé).
router.post('/', auth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const title = String(body.title ?? '').trim();
    const content = String(body.body ?? '');
    if (title.length < 3) {
      return res.status(400).json({ error: 'Le titre doit faire au moins 3 caractères.' });
    }
    const status = body.status === 'published' ? 'published' : 'draft';

    const doc = await Article.create({
      title,
      slug: await uniqueSlug(Article, body.slug || title),
      excerpt: String(body.excerpt ?? '').trim() || toPlainText(content, 200),
      body: content,
      coverImage: String(body.coverImage ?? '').trim(),
      coverAlt: String(body.coverAlt ?? '').trim(),
      tags: Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : [],
      author: String(body.author ?? '').trim() || req.user?.name || '',
      status,
      publishedAt: status === 'published' ? new Date() : null,
    });

    res.status(201).json(fromDb(doc.toObject()));
  } catch (e) {
    next(e);
  }
});

// PUT /api/articles/:id — mettre à jour (protégé).
router.put('/:id', auth, async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article introuvable.' });

    const body = req.body || {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (title.length < 3) {
        return res.status(400).json({ error: 'Le titre doit faire au moins 3 caractères.' });
      }
      article.title = title;
    }

    // On ne recalcule le slug que s'il est fourni explicitement : le changer
    // après publication casse tous les liens existants vers l'article.
    if (body.slug !== undefined && String(body.slug).trim()) {
      article.slug = await uniqueSlug(Article, String(body.slug), req.params.id);
    }

    if (body.body !== undefined) article.body = String(body.body);
    if (body.coverImage !== undefined) article.coverImage = String(body.coverImage).trim();
    if (body.coverAlt !== undefined) article.coverAlt = String(body.coverAlt).trim();
    if (body.author !== undefined) article.author = String(body.author).trim();

    if (body.excerpt !== undefined) {
      article.excerpt = String(body.excerpt).trim() || toPlainText(article.body, 200);
    }

    if (body.tags !== undefined) {
      article.tags = Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : [];
    }

    if (body.status !== undefined) {
      const status = body.status === 'published' ? 'published' : 'draft';
      article.status = status;
      // Horodate la publication une seule fois, à la première publication.
      if (status === 'published' && !article.publishedAt) {
        article.publishedAt = new Date();
      }
    }

    await article.save();
    res.json(fromDb(article.toObject()));
  } catch (e) {
    next(e);
  }
});

// DELETE /api/articles/:id — supprimer (protégé).
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article introuvable.' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// GET /api/articles/:slug — un article PUBLIÉ par slug, avec le HTML rendu.
// Déclaré en DERNIER pour ne capturer que ce qui n'est pas /admin/*.
router.get('/:slug', async (req, res, next) => {
  try {
    const doc = await Article.findOne({ slug: req.params.slug, status: 'published' }).lean();
    if (!doc) return res.status(404).json({ error: 'Article introuvable.' });
    res.json({ ...fromDb(doc), html: renderMarkdown(doc.body) });
  } catch (e) {
    next(e);
  }
});

export default router;
