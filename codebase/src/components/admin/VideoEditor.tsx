'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import ImageField from './ImageField';
import VideoField from './VideoField';

export interface VideoFormValues {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  poster: string;
  order: number;
  status: 'draft' | 'published';
}

const EMPTY: VideoFormValues = {
  title: '',
  description: '',
  videoUrl: '',
  poster: '',
  order: 100,
  status: 'draft',
};

export default function VideoEditor({ initial }: { initial?: VideoFormValues }) {
  const router = useRouter();
  const isNew = !initial?.id;

  const [values, setValues] = useState<VideoFormValues>(initial ?? EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  function set<K extends keyof VideoFormValues>(key: K, value: VideoFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save(status?: 'draft' | 'published') {
    setError('');
    setNotice('');

    if (!values.videoUrl.trim()) {
      setError('Ajoutez une vidéo (fichier téléversé ou URL) avant d’enregistrer.');
      return;
    }

    setBusy(true);
    const payload = { ...values, status: status ?? values.status };

    try {
      const saved = isNew
        ? await adminApi.createVideo(payload)
        : await adminApi.updateVideo(initial!.id!, payload);

      if (isNew) {
        router.push(`/admin/videos/edit?id=${saved.id}`);
        return;
      }

      setValues((v) => ({ ...v, status: saved.status }));
      setNotice(
        saved.status === 'published'
          ? 'Vidéo enregistrée et publiée — en ligne au prochain déploiement.'
          : 'Brouillon enregistré.',
      );
    } catch (err) {
      setError((err as Error).message || 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Supprimer définitivement cette vidéo ?')) return;

    setBusy(true);
    try {
      await adminApi.deleteVideo(initial!.id!);
      router.push('/admin/videos');
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
          <h1>{isNew ? 'Nouvelle vidéo' : 'Modifier la vidéo'}</h1>
          <p className="a-sub">
            {values.status === 'published'
              ? 'Publiée — visible dans la section « L’académie en mouvement » de l’accueil.'
              : 'Brouillon — invisible sur le site public.'}
          </p>
        </div>
        <Link href="/admin/videos" className="a-btn">
          ← Toutes les vidéos
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
            Titre de la vidéo
          </label>
          <input
            id="title"
            className="a-input"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            maxLength={160}
            required
          />
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="description">
            Légende
            <span className="a-hint"> — courte phrase affichée sous la vidéo (facultatif)</span>
          </label>
          <textarea
            id="description"
            className="a-textarea"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            maxLength={600}
            placeholder="Démonstration de Wing Chun, stage d’été, remise des ceintures…"
          />
        </div>

        <VideoField value={values.videoUrl} onChange={(url) => set('videoUrl', url)} />

        <ImageField
          value={values.poster}
          onChange={(url) => set('poster', url)}
          label="Image d’aperçu (poster)"
        />

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
