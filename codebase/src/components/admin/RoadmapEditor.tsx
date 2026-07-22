'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { normalizeRoadmap, type Roadmap } from '@/lib/roadmap';
import ImageField from './ImageField';
import FileField from './FileField';

/** Les champs du formulaire sont exactement ceux du parcours (voir lib/roadmap). */
export type RoadmapFormValues = Roadmap;

const EMPTY: RoadmapFormValues = {
  imageUrl: '',
  imageAlt: '',
  fileUrl: '',
  note: '',
  published: false,
};

/**
 * Single-document editor for the /parcours page. The roadmap is one uploaded
 * illustration (image) or PDF — there is exactly one for the whole academy —
 * so this is a settings-style form, not a list.
 */
export default function RoadmapEditor({ initial }: { initial?: RoadmapFormValues }) {
  const [values, setValues] = useState<RoadmapFormValues>(initial ?? EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  function set<K extends keyof RoadmapFormValues>(key: K, value: RoadmapFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save(publish: boolean) {
    setError('');
    setNotice('');
    setBusy(true);

    try {
      const saved = normalizeRoadmap(
        await adminApi.updateRoadmap({ ...values, published: publish }),
      );
      setValues(saved);
      setNotice(
        saved.published
          ? 'Parcours enregistré et publié — visible sur la page Parcours au prochain déploiement.'
          : 'Brouillon enregistré — invisible sur le site public.',
      );
    } catch (err) {
      setError((err as Error).message || 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  }

  const hasContent = Boolean(values.imageUrl.trim() || values.fileUrl.trim());

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Parcours de l’élève</h1>
          <p className="a-sub">
            {values.published
              ? 'Publié — visible sur la page Parcours.'
              : 'Brouillon — invisible sur le site public.'}
          </p>
        </div>
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
        <p className="a-hint" style={{ marginTop: 0 }}>
          Téléversez le schéma du parcours : une <strong>image</strong> (affichée
          directement sur la page) ou un <strong>PDF</strong>. Vous pouvez fournir
          les deux — l’image sert d’aperçu, le PDF de version téléchargeable.
        </p>

        <ImageField
          value={values.imageUrl}
          onChange={(url) => set('imageUrl', url)}
          label="Image du parcours (affichée sur la page)"
        />

        <div className="a-field">
          <label className="a-label" htmlFor="imageAlt">
            Texte alternatif de l’image
            <span className="a-hint"> — décrit l’image (accessibilité &amp; SEO)</span>
          </label>
          <input
            id="imageAlt"
            className="a-input"
            value={values.imageAlt}
            onChange={(e) => set('imageAlt', e.target.value)}
            maxLength={300}
            placeholder="Ex. : Le parcours de progression de l’élève, du débutant au niveau avancé"
          />
        </div>

        <FileField
          value={values.fileUrl}
          onChange={(url) => set('fileUrl', url)}
          label="PDF ou fichier téléchargeable (facultatif)"
          hint="PDF de préférence ; 4 Mo max, sinon collez une URL"
        />

        <div className="a-field">
          <label className="a-label" htmlFor="note">
            Légende sous le schéma (facultatif)
          </label>
          <textarea
            id="note"
            className="a-textarea"
            value={values.note}
            onChange={(e) => set('note', e.target.value)}
            maxLength={600}
            placeholder="Une phrase de contexte affichée sous l’image…"
          />
          <span className="a-hint">{values.note.length}/600</span>
        </div>

        <div className="a-formFooter">
          <button type="button" className="a-btn" onClick={() => save(false)} disabled={busy}>
            Enregistrer le brouillon
          </button>
          <button
            type="button"
            className="a-btn a-btn-primary"
            onClick={() => save(true)}
            disabled={busy || !hasContent}
            title={hasContent ? undefined : 'Ajoutez une image ou un PDF d’abord.'}
          >
            {values.published ? 'Mettre à jour' : 'Publier'}
          </button>
        </div>
      </div>
    </>
  );
}
