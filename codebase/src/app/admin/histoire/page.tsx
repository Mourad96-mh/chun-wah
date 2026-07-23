'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import ImageField from '@/components/admin/ImageField';
import { adminApi } from '@/lib/adminApi';

type AdminMilestone = {
  _id: string;
  year: string;
  titleFr?: string;
  titleEn?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  image?: string;
  order?: number;
  active?: boolean;
};

type FormState = {
  year: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  image: string;
  order: string;
  active: boolean;
};

const empty: FormState = {
  year: '',
  titleFr: '',
  titleEn: '',
  descriptionFr: '',
  descriptionEn: '',
  image: '',
  order: '',
  active: true,
};

function toForm(m: AdminMilestone): FormState {
  return {
    year: m.year ?? '',
    titleFr: m.titleFr ?? '',
    titleEn: m.titleEn ?? '',
    descriptionFr: m.descriptionFr ?? '',
    descriptionEn: m.descriptionEn ?? '',
    image: m.image ?? '',
    order: m.order != null ? String(m.order) : '',
    active: m.active !== false,
  };
}

function toPayload(f: FormState) {
  return {
    year: f.year.trim(),
    titleFr: f.titleFr.trim(),
    titleEn: f.titleEn.trim(),
    descriptionFr: f.descriptionFr.trim(),
    descriptionEn: f.descriptionEn.trim(),
    image: f.image.trim(),
    order: f.order ? Number(f.order) : 0,
    active: f.active,
  };
}

export default function HistoryAdmin() {
  const [items, setItems] = useState<AdminMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.listMilestones();
      setItems(Array.isArray(data) ? data : []);
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

  function openEdit(m: AdminMilestone) {
    setForm(toForm(m));
    setEditingId(m._id);
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
    if (!form.year.trim()) {
      setError("L'année / l'étiquette est requise.");
      return;
    }
    setSaving(true);
    try {
      if (editingId === 'new') {
        await adminApi.createMilestone(toPayload(form));
      } else if (editingId) {
        await adminApi.updateMilestone(editingId, toPayload(form));
      }
      close();
      await load();
    } catch (err) {
      setError((err as Error).message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function remove(m: AdminMilestone) {
    if (!confirm(`Supprimer le jalon « ${m.year} » ?`)) return;
    setError('');
    try {
      await adminApi.deleteMilestone(m._id);
      await load();
    } catch (err) {
      setError((err as Error).message || 'Échec de la suppression');
    }
  }

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Histoire</h1>
          <p className="a-sub">
            La frise chronologique « Notre histoire » de la page d’accueil. Chaque
            jalon a une étiquette d’année (« Ouverture », « 2020 »,
            « Aujourd’hui »), un titre et une description en français et en anglais,
            et une image facultative. Les jalons s’affichent dans l’ordre choisi.
            Sans jalon actif, la section n’apparaît pas sur l’accueil.
          </p>
        </div>
        {!editingId && (
          <button className="a-btn a-btn-primary" onClick={openNew}>
            + Nouveau jalon
          </button>
        )}
      </div>

      {error && !editingId && (
        <div className="a-alert a-alert-error" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {editingId ? (
        <form className="a-card a-form" onSubmit={save}>
          <h2>{editingId === 'new' ? 'Nouveau jalon' : 'Modifier le jalon'}</h2>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="year">
                Année / étiquette *
              </label>
              <input
                id="year"
                className="a-input"
                value={form.year}
                onChange={setField('year')}
                placeholder="Ouverture · 2020 · Aujourd’hui"
              />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="order">
                Ordre d’affichage <span className="a-hint">— plus petit = plus haut</span>
              </label>
              <input id="order" type="number" className="a-input" value={form.order} onChange={setField('order')} placeholder="0" />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="titleFr">Titre (français)</label>
              <input id="titleFr" className="a-input" value={form.titleFr} onChange={setField('titleFr')} placeholder="Ouverture de l’académie" />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="titleEn">Titre (anglais)</label>
              <input id="titleEn" className="a-input" value={form.titleEn} onChange={setField('titleEn')} placeholder="The academy opens" />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="descriptionFr">Description (français)</label>
              <textarea id="descriptionFr" className="a-textarea" rows={3} value={form.descriptionFr} onChange={setField('descriptionFr')} placeholder="Ce qui s'est passé cette année-là…" />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="descriptionEn">Description (anglais)</label>
              <textarea id="descriptionEn" className="a-textarea" rows={3} value={form.descriptionEn} onChange={setField('descriptionEn')} placeholder="What happened that year…" />
            </div>
          </div>

          <ImageField
            id="milestone-image"
            label="Image (facultative)"
            hint="Format paysage (~16:9)."
            folder="chunwah/history"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />

          <div className="a-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Jalon actif (visible sur le site)
            </label>
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
      ) : items.length === 0 ? (
        <div className="a-empty">
          Aucun jalon. La section « Notre histoire » n’apparaît pas sur l’accueil
          tant que vous n’en ajoutez pas.
        </div>
      ) : (
        <div className="a-tableWrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Année</th>
                <th>Titre</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m._id}>
                  <td><span className="a-rowTitle">{m.year}</span></td>
                  <td>{m.titleFr || '—'}</td>
                  <td>{m.order ?? 0}</td>
                  <td>
                    {m.active !== false ? (
                      <span className="a-badge a-badge-published">Actif</span>
                    ) : (
                      <span className="a-badge a-badge-draft">Inactif</span>
                    )}
                  </td>
                  <td>
                    <div className="a-actions">
                      <button className="a-btn" onClick={() => openEdit(m)}>Modifier</button>
                      <button className="a-btn a-btn-danger" onClick={() => remove(m)}>Supprimer</button>
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
