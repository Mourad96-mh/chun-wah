'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import ImageField from '@/components/admin/ImageField';
import RoadmapCopyEditor from '@/components/admin/RoadmapCopyEditor';
import { adminApi } from '@/lib/adminApi';

type AdminStep = {
  _id: string;
  image: string;
  titleFr?: string;
  titleEn?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  order?: number;
  active?: boolean;
};

type FormState = {
  image: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  order: string;
  active: boolean;
};

const empty: FormState = {
  image: '',
  titleFr: '',
  titleEn: '',
  descriptionFr: '',
  descriptionEn: '',
  order: '',
  active: true,
};

function toForm(s: AdminStep): FormState {
  return {
    image: s.image ?? '',
    titleFr: s.titleFr ?? '',
    titleEn: s.titleEn ?? '',
    descriptionFr: s.descriptionFr ?? '',
    descriptionEn: s.descriptionEn ?? '',
    order: s.order != null ? String(s.order) : '',
    active: s.active !== false,
  };
}

function toPayload(f: FormState) {
  return {
    image: f.image.trim(),
    titleFr: f.titleFr.trim(),
    titleEn: f.titleEn.trim(),
    descriptionFr: f.descriptionFr.trim(),
    descriptionEn: f.descriptionEn.trim(),
    order: f.order ? Number(f.order) : 0,
    active: f.active,
  };
}

export default function RoadmapAdmin() {
  const [steps, setSteps] = useState<AdminStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null); // null = fermé, 'new' = création
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.listRoadmapSteps();
      setSteps(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message || 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(empty);
    setEditingId('new');
    setError('');
  }

  function openEdit(s: AdminStep) {
    setForm(toForm(s));
    setEditingId(s._id);
    setError('');
  }

  function close() {
    setEditingId(null);
    setError('');
  }

  const setField =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.image.trim()) {
      setError("L'image de l'étape est requise.");
      return;
    }
    setSaving(true);
    try {
      if (editingId === 'new') {
        await adminApi.createRoadmapStep(toPayload(form));
      } else if (editingId) {
        await adminApi.updateRoadmapStep(editingId, toPayload(form));
      }
      close();
      await load();
    } catch (err) {
      setError((err as Error).message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function remove(s: AdminStep) {
    if (!confirm(`Supprimer l’étape « ${s.titleFr || s._id} » ?`)) return;
    setError('');
    try {
      await adminApi.deleteRoadmapStep(s._id);
      await load();
    } catch (err) {
      setError((err as Error).message || 'Échec de la suppression');
    }
  }

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Parcours de l’élève</h1>
          <p className="a-sub">
            La frise de progression affichée sur la page « Parcours ». Chaque étape
            est une image avec un titre et une description, en français et en
            anglais. Les étapes s’affichent dans l’ordre choisi, du premier au
            dernier. Sans étape active, la page affiche « le parcours arrive
            bientôt ».
          </p>
        </div>
        {!editingId && (
          <button className="a-btn a-btn-primary" onClick={openNew}>
            + Nouvelle étape
          </button>
        )}
      </div>

      {error && !editingId && (
        <div className="a-alert a-alert-error" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Textes fixes de la page (titre, intro, CTA) — repliés par défaut. */}
      {!editingId && <RoadmapCopyEditor />}

      {editingId ? (
        <form className="a-card a-form" onSubmit={save}>
          <h2>{editingId === 'new' ? 'Nouvelle étape' : 'Modifier l’étape'}</h2>

          <ImageField
            id="step-image"
            label="Image de l’étape *"
            hint="Format paysage (~4:3). Photo de cours, technique, ou illustration de l’étape."
            folder="chunwah/roadmap"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="titleFr">
                Titre (français)
              </label>
              <input
                id="titleFr"
                className="a-input"
                value={form.titleFr}
                onChange={setField('titleFr')}
                placeholder="Fondations"
              />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="titleEn">
                Titre (anglais)
              </label>
              <input
                id="titleEn"
                className="a-input"
                value={form.titleEn}
                onChange={setField('titleEn')}
                placeholder="Foundations"
              />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="descriptionFr">
                Description (français)
              </label>
              <textarea
                id="descriptionFr"
                className="a-textarea"
                rows={4}
                value={form.descriptionFr}
                onChange={setField('descriptionFr')}
                placeholder="On installe les bases qui serviront toute la vie…"
              />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="descriptionEn">
                Description (anglais)
              </label>
              <textarea
                id="descriptionEn"
                className="a-textarea"
                rows={4}
                value={form.descriptionEn}
                onChange={setField('descriptionEn')}
                placeholder="We lay the base you build on for life…"
              />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="order">
                Ordre d’affichage <span className="a-hint">— plus petit = plus tôt</span>
              </label>
              <input
                id="order"
                type="number"
                className="a-input"
                value={form.order}
                onChange={setField('order')}
                placeholder="0"
              />
            </div>
            <div className="a-field">
              <label className="a-label">Statut</label>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.4rem' }}
              >
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Étape active (visible sur le site)
              </label>
            </div>
          </div>

          {error && (
            <div className="a-alert a-alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="a-formFooter">
            <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button type="button" className="a-btn" onClick={close} disabled={saving}>
              Annuler
            </button>
          </div>
        </form>
      ) : loading ? (
        <p className="a-sub">Chargement…</p>
      ) : steps.length === 0 ? (
        <div className="a-empty">
          Aucune étape. La page « Parcours » affiche « le parcours arrive bientôt ».
          Ajoutez une première étape pour construire la frise.
        </div>
      ) : (
        <div className="a-tableWrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Étape</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="a-thumb"
                        src={s.image}
                        alt=""
                        style={{ width: 80, height: 60 }}
                      />
                      <div>
                        <span className="a-rowTitle">{s.titleFr || '—'}</span>
                        {s.descriptionFr && <span className="a-rowMeta">{s.descriptionFr}</span>}
                      </div>
                    </div>
                  </td>
                  <td>{s.order ?? 0}</td>
                  <td>
                    {s.active !== false ? (
                      <span className="a-badge a-badge-published">Active</span>
                    ) : (
                      <span className="a-badge a-badge-draft">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="a-actions">
                      <button className="a-btn" onClick={() => openEdit(s)}>
                        Modifier
                      </button>
                      <button className="a-btn a-btn-danger" onClick={() => remove(s)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
