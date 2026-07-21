'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import ImageField from './ImageField';

export interface BookFormValues {
  id?: string;
  title: string;
  author: string;
  recommendation: string;
  coverImage: string;
  level: string;
  category: string;
  order: number;
  status: 'draft' | 'published';
}

const EMPTY: BookFormValues = {
  title: '',
  author: '',
  recommendation: '',
  coverImage: '',
  level: '',
  category: '',
  order: 100,
  status: 'draft',
};

export default function BookEditor({ initial }: { initial?: BookFormValues }) {
  const router = useRouter();
  const isNew = !initial?.id;

  const [values, setValues] = useState<BookFormValues>(initial ?? EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  function set<K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save(status?: 'draft' | 'published') {
    setError('');
    setNotice('');
    setBusy(true);

    const payload = { ...values, status: status ?? values.status };

    try {
      // L'API (Express) renvoie directement le livre : { id, status, … }.
      const book = isNew
        ? await adminApi.createBook(payload)
        : await adminApi.updateBook(initial!.id!, payload);

      if (isNew) {
        router.push(`/admin/livres/edit?id=${book.id}`);
        return;
      }

      setValues((v) => ({ ...v, status: book.status }));
      setNotice(
        book.status === 'published' ? 'Livre enregistré et publié.' : 'Brouillon enregistré.',
      );
    } catch (err) {
      setError((err as Error).message || 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Supprimer définitivement ce livre ?')) return;

    setBusy(true);
    try {
      await adminApi.deleteBook(initial!.id!);
      router.push('/admin/livres');
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
          <h1>{isNew ? 'Nouveau livre' : 'Modifier le livre'}</h1>
          <p className="a-sub">
            {values.status === 'published'
              ? 'Publié — visible sur la page Livres.'
              : 'Brouillon — invisible sur le site public.'}
          </p>
        </div>
        <Link href="/admin/livres" className="a-btn">
          ← Tous les livres
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
        <div className="a-grid2">
          <div className="a-field">
            <label className="a-label" htmlFor="title">
              Titre du livre
            </label>
            <input
              id="title"
              className="a-input"
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              required
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
              required
            />
          </div>
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="recommendation">
            Pourquoi le recommander
            <span className="a-hint"> — c’est tout l’intérêt de la page, soyez personnel</span>
          </label>
          <textarea
            id="recommendation"
            className="a-textarea"
            value={values.recommendation}
            onChange={(e) => set('recommendation', e.target.value)}
            maxLength={1200}
            placeholder="Ce que ce livre apporte, à qui il s’adresse, ce qu’on y trouve qu’on ne trouve pas ailleurs…"
            required
          />
          <span className="a-hint">{values.recommendation.length}/1200</span>
        </div>

        <ImageField
          value={values.coverImage}
          onChange={(url) => set('coverImage', url)}
          label="Couverture du livre"
          folder="chunwah/livres"
        />

        <div className="a-grid2">
          <div className="a-field">
            <label className="a-label" htmlFor="level">
              Niveau
            </label>
            <input
              id="level"
              className="a-input"
              value={values.level}
              onChange={(e) => set('level', e.target.value)}
              placeholder="Débutant, Tous niveaux…"
            />
          </div>

          <div className="a-field">
            <label className="a-label" htmlFor="category">
              Catégorie
              <span className="a-hint"> — regroupe les livres sur la page</span>
            </label>
            <input
              id="category"
              className="a-input"
              value={values.category}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Wing Chun, Philosophie, Préparation physique…"
            />
          </div>
        </div>

        <div className="a-field" style={{ maxWidth: 220 }}>
          <label className="a-label" htmlFor="order">
            Ordre d’affichage
            <span className="a-hint"> — petit = affiché en premier</span>
          </label>
          <input
            id="order"
            type="number"
            className="a-input"
            value={values.order}
            onChange={(e) => set('order', Number(e.target.value))}
          />
        </div>

        <div className="a-formFooter">
          <button type="button" className="a-btn" onClick={() => save('draft')} disabled={busy}>
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
