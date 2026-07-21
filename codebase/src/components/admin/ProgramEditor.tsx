'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageField from './ImageField';

export interface ProgramFormValues {
  _id?: string;
  name: string;
  slug: string;
  order: number;
  tagline: string;
  intro: string;
  /** One benefit per line in the textarea. */
  benefits: string;
  ageRange: string;
  level: string;
  duration: string;
  image: string;
  imageAlt: string;
  status: 'draft' | 'published';
}

const EMPTY: ProgramFormValues = {
  name: '',
  slug: '',
  order: 100,
  tagline: '',
  intro: '',
  benefits: '',
  ageRange: '',
  level: '',
  duration: '',
  image: '',
  imageAlt: '',
  status: 'draft',
};

export default function ProgramEditor({ initial }: { initial?: ProgramFormValues }) {
  const router = useRouter();
  const isNew = !initial?._id;

  const [values, setValues] = useState<ProgramFormValues>(initial ?? EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  function set<K extends keyof ProgramFormValues>(key: K, value: ProgramFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save(status?: 'draft' | 'published') {
    setError('');
    setNotice('');
    setBusy(true);

    const payload = { ...values, status: status ?? values.status };

    try {
      const res = await fetch(
        isNew ? '/api/admin/programs' : `/api/admin/programs/${initial!._id}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Enregistrement impossible.');
        return;
      }

      if (isNew) {
        router.push(`/admin/cours/${data.program._id}`);
        router.refresh();
        return;
      }

      setValues((v) => ({ ...v, status: data.program.status, slug: data.program.slug }));
      setNotice(
        data.program.status === 'published'
          ? 'Cours enregistré et publié — visible sur le site.'
          : 'Brouillon enregistré — invisible sur le site public.',
      );
      router.refresh();
    } catch {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Supprimer définitivement ce cours ?')) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/programs/${initial!._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Suppression impossible.');
        return;
      }
      router.push('/admin/cours');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="a-head">
        <div>
          <h1>{isNew ? 'Nouveau cours' : 'Modifier le cours'}</h1>
          <p className="a-sub">
            {values.status === 'published'
              ? 'Publié — visible sur le site.'
              : 'Brouillon — invisible sur le site public.'}
          </p>
        </div>
        <Link href="/admin/cours" className="a-btn">
          ← Tous les cours
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
            <label className="a-label" htmlFor="name">
              Nom du cours
            </label>
            <input
              id="name"
              className="a-input"
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>

          <div className="a-field">
            <label className="a-label" htmlFor="slug">
              Adresse (slug)
              <span className="a-hint"> — laissez vide pour la générer depuis le nom</span>
            </label>
            <input
              id="slug"
              className="a-input"
              value={values.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="wing-chun-adultes"
            />
          </div>
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="tagline">
            Accroche
            <span className="a-hint"> — une ligne, affichée sur les cartes</span>
          </label>
          <input
            id="tagline"
            className="a-input"
            value={values.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            maxLength={300}
          />
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="intro">
            Présentation
            <span className="a-hint"> — le paragraphe d’intro de la page du cours</span>
          </label>
          <textarea
            id="intro"
            className="a-textarea"
            value={values.intro}
            onChange={(e) => set('intro', e.target.value)}
            maxLength={3000}
          />
        </div>

        <div className="a-field">
          <label className="a-label" htmlFor="benefits">
            Bénéfices
            <span className="a-hint"> — un par ligne ; affichés en liste à puces</span>
          </label>
          <textarea
            id="benefits"
            className="a-textarea"
            value={values.benefits}
            onChange={(e) => set('benefits', e.target.value)}
            placeholder={'Self-défense applicable dès les premiers mois\nCondition physique et coordination'}
          />
        </div>

        <div className="a-grid2">
          <div className="a-field">
            <label className="a-label" htmlFor="ageRange">
              Âge
            </label>
            <input
              id="ageRange"
              className="a-input"
              value={values.ageRange}
              onChange={(e) => set('ageRange', e.target.value)}
              placeholder="16 ans et +"
            />
          </div>

          <div className="a-field">
            <label className="a-label" htmlFor="level">
              Niveau
            </label>
            <input
              id="level"
              className="a-input"
              value={values.level}
              onChange={(e) => set('level', e.target.value)}
              placeholder="Débutant à avancé"
            />
          </div>
        </div>

        <div className="a-grid2">
          <div className="a-field">
            <label className="a-label" htmlFor="duration">
              Durée d’une séance
            </label>
            <input
              id="duration"
              className="a-input"
              value={values.duration}
              onChange={(e) => set('duration', e.target.value)}
              placeholder="1 h 30"
            />
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
        </div>

        <ImageField
          id="program-image"
          label="Image du cours"
          hint="format paysage, ~1200×800"
          value={values.image}
          onChange={(url) => set('image', url)}
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
