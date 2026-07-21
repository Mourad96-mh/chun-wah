'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import ImageField from './ImageField';

export interface ArticleFormValues {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  coverAlt: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published';
}

const EMPTY: ArticleFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  coverImage: '',
  coverAlt: '',
  tags: [],
  author: '',
  status: 'draft',
};

/** Minimal Markdown preview — good enough to reassure, not a renderer clone. */
function previewHtml(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return escape(md)
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^&gt; (.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^[-*] (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .split(/\n{2,}/)
    .map((block) => (block.trim().startsWith('<') ? block : `<p>${block}</p>`))
    .join('\n');
}

export default function ArticleEditor({ initial }: { initial?: ArticleFormValues }) {
  const router = useRouter();
  const isNew = !initial?.id;

  const [values, setValues] = useState<ArticleFormValues>(initial ?? EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const preview = useMemo(() => previewHtml(values.body), [values.body]);

  function set<K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  /** Wraps the selection with Markdown syntax, keeping focus in the textarea. */
  function wrap(before: string, after = before) {
    const el = bodyRef.current;
    if (!el) return;

    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end) || 'texte';
    const next = value.slice(0, start) + before + selected + after + value.slice(end);

    set('body', next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  async function save(status?: 'draft' | 'published') {
    setError('');
    setNotice('');
    setBusy(true);

    const payload = { ...values, status: status ?? values.status };

    try {
      // L'API (Express) renvoie directement l'article : { id, slug, status, … }.
      const article = isNew
        ? await adminApi.createArticle(payload)
        : await adminApi.updateArticle(initial!.id!, payload);

      if (isNew) {
        router.push(`/admin/articles/edit?id=${article.id}`);
        return;
      }

      setValues((v) => ({ ...v, status: article.status, slug: article.slug }));
      setNotice(
        article.status === 'published'
          ? 'Article enregistré et publié.'
          : 'Brouillon enregistré.',
      );
    } catch (err) {
      setError((err as Error).message || 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Supprimer définitivement cet article ?')) return;

    setBusy(true);
    try {
      await adminApi.deleteArticle(initial!.id!);
      router.push('/admin/articles');
    } catch (err) {
      setError((err as Error).message || 'Suppression impossible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="a-head">
        <div>
          <h1>{isNew ? 'Nouvel article' : 'Modifier l’article'}</h1>
          <p className="a-sub">
            {values.status === 'published' ? (
              <>
                Publié —{' '}
                <Link href={`/fr/blog/${values.slug}`} target="_blank">
                  voir sur le site ↗
                </Link>
              </>
            ) : (
              'Brouillon — invisible sur le site public.'
            )}
          </p>
        </div>
        <Link href="/admin/articles" className="a-btn">
          ← Tous les articles
        </Link>
      </div>

      {error && (
        <div className="a-alert a-alert-error" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      {notice && (
        <div className="a-alert a-alert-success" role="status" style={{ marginBottom: '1rem' }}>
          {notice}
        </div>
      )}

      <div className="a-card a-form">
        <div className="a-field">
          <label className="a-label" htmlFor="title">
            Titre
          </label>
          <input
            id="title"
            className="a-input"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Quel art martial pour un enfant de 7 ans ?"
            required
          />
        </div>

        <div className="a-grid2">
          <div className="a-field">
            <label className="a-label" htmlFor="slug">
              Adresse de la page
              <span className="a-hint"> — laissez vide pour la générer</span>
            </label>
            <input
              id="slug"
              className="a-input"
              value={values.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="quel-art-martial-pour-un-enfant"
            />
          </div>

          <div className="a-field">
            <label className="a-label" htmlFor="author">
              Auteur
            </label>
            <input
              id="author"
              className="a-input"
              value={values.author}
              onChange={(e) => set('author', e.target.value)}
            />
          </div>
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="excerpt">
            Résumé
            <span className="a-hint">
              {' '}
              — s’affiche sur la liste du blog et dans Google (160–320 caractères)
            </span>
          </label>
          <textarea
            id="excerpt"
            className="a-textarea"
            style={{ minHeight: 80 }}
            value={values.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
            maxLength={320}
          />
          <span className="a-hint">{values.excerpt.length}/320</span>
        </div>

        <ImageField value={values.coverImage} onChange={(url) => set('coverImage', url)} />

        {values.coverImage && (
          <div className="a-field">
            <label className="a-label" htmlFor="coverAlt">
              Description de l’image
              <span className="a-hint"> — pour les lecteurs d’écran et Google Images</span>
            </label>
            <input
              id="coverAlt"
              className="a-input"
              value={values.coverAlt}
              onChange={(e) => set('coverAlt', e.target.value)}
            />
          </div>
        )}

        <div className="a-field">
          <label className="a-label" htmlFor="tags">
            Mots-clés
            <span className="a-hint"> — séparés par des virgules</span>
          </label>
          <input
            id="tags"
            className="a-input"
            value={values.tags.join(', ')}
            onChange={(e) =>
              set(
                'tags',
                e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              )
            }
            placeholder="wing chun, enfants, self-défense"
          />
        </div>

        <div className="a-field">
          <span className="a-label">Contenu</span>
          <div className="a-toolbar">
            <button type="button" className="a-toolBtn" onClick={() => wrap('**')}>
              Gras
            </button>
            <button type="button" className="a-toolBtn" onClick={() => wrap('*')}>
              Italique
            </button>
            <button type="button" className="a-toolBtn" onClick={() => wrap('\n## ', '')}>
              Titre
            </button>
            <button type="button" className="a-toolBtn" onClick={() => wrap('\n### ', '')}>
              Sous-titre
            </button>
            <button type="button" className="a-toolBtn" onClick={() => wrap('\n- ', '')}>
              Liste
            </button>
            <button type="button" className="a-toolBtn" onClick={() => wrap('[', '](https://)')}>
              Lien
            </button>
            <button type="button" className="a-toolBtn" onClick={() => wrap('\n> ', '')}>
              Citation
            </button>
          </div>

          <div className="a-split">
            <textarea
              ref={bodyRef}
              className="a-textarea a-editor"
              value={values.body}
              onChange={(e) => set('body', e.target.value)}
              placeholder={'## Un sous-titre\n\nVotre texte…'}
            />
            <div className="a-preview" aria-label="Aperçu">
              <div dangerouslySetInnerHTML={{ __html: preview }} />
            </div>
          </div>
        </div>

        <div className="a-formFooter">
          <button
            type="button"
            className="a-btn"
            onClick={() => save('draft')}
            disabled={busy}
          >
            Enregistrer le brouillon
          </button>
          <button
            type="button"
            className="a-btn a-btn-primary"
            onClick={() => save('published')}
            disabled={busy}
          >
            {values.status === 'published' ? 'Mettre à jour' : 'Publier'}
          </button>

          <span className="a-spacer" />

          {!isNew && (
            <button type="button" className="a-btn a-btn-danger" onClick={remove} disabled={busy}>
              Supprimer
            </button>
          )}
        </div>
      </div>
    </>
  );
}
