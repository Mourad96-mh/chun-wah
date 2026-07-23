'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import ImageField from '@/components/admin/ImageField';
import { adminApi } from '@/lib/adminApi';

type AdminBanner = {
  _id: string;
  image: string;
  imageMobile?: string;
  titleFr?: string;
  titleEn?: string;
  subtitleFr?: string;
  subtitleEn?: string;
  order?: number;
  active?: boolean;
};

type FormState = {
  image: string;
  imageMobile: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  order: string;
  active: boolean;
};

const empty: FormState = {
  image: '',
  imageMobile: '',
  titleFr: '',
  titleEn: '',
  subtitleFr: '',
  subtitleEn: '',
  order: '',
  active: true,
};

function toForm(b: AdminBanner): FormState {
  return {
    image: b.image ?? '',
    imageMobile: b.imageMobile ?? '',
    titleFr: b.titleFr ?? '',
    titleEn: b.titleEn ?? '',
    subtitleFr: b.subtitleFr ?? '',
    subtitleEn: b.subtitleEn ?? '',
    order: b.order != null ? String(b.order) : '',
    active: b.active !== false,
  };
}

function toPayload(f: FormState) {
  return {
    image: f.image.trim(),
    imageMobile: f.imageMobile.trim(),
    titleFr: f.titleFr.trim(),
    titleEn: f.titleEn.trim(),
    subtitleFr: f.subtitleFr.trim(),
    subtitleEn: f.subtitleEn.trim(),
    order: f.order ? Number(f.order) : 0,
    active: f.active,
  };
}

export default function BannersAdmin() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null); // null = fermé, 'new' = création
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.listBanners();
      setBanners(Array.isArray(data) ? data : []);
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

  function openEdit(b: AdminBanner) {
    setForm(toForm(b));
    setEditingId(b._id);
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
      setError("L'image de fond (desktop) est requise.");
      return;
    }
    setSaving(true);
    try {
      if (editingId === 'new') {
        await adminApi.createBanner(toPayload(form));
      } else if (editingId) {
        await adminApi.updateBanner(editingId, toPayload(form));
      }
      close();
      await load();
    } catch (err) {
      setError((err as Error).message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function remove(b: AdminBanner) {
    if (!confirm(`Supprimer la diapositive « ${b.titleFr || b._id} » ?`)) return;
    setError('');
    try {
      await adminApi.deleteBanner(b._id);
      await load();
    } catch (err) {
      setError((err as Error).message || 'Échec de la suppression');
    }
  }

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Bannières</h1>
          <p className="a-sub">
            Le diaporama d’images en haut de la page d’accueil. Chaque diapositive
            est une image de fond (~1920×1080) avec un titre et une description en
            français et en anglais. Les boutons « Essai gratuit » et « Horaires »
            restent fixes. Sans diapositive active, l’accueil affiche l’image hero
            unique de la page « Images ».
          </p>
        </div>
        {!editingId && (
          <button className="a-btn a-btn-primary" onClick={openNew}>
            + Nouvelle diapositive
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
          <h2>{editingId === 'new' ? 'Nouvelle diapositive' : 'Modifier la diapositive'}</h2>

          <ImageField
            id="banner-image"
            label="Image de fond — desktop *"
            hint="~1920×1080. Sert de fond sous le texte — évitez le texte dans l’image."
            folder="chunwah/banners"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />

          <ImageField
            id="banner-image-mobile"
            label="Image mobile (optionnelle)"
            hint="Format plus carré pour les téléphones. À défaut, l’image desktop est utilisée."
            folder="chunwah/banners"
            value={form.imageMobile}
            onChange={(url) => setForm((f) => ({ ...f, imageMobile: url }))}
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
                placeholder="Art martial chinois à Casablanca"
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
                placeholder="Chinese martial arts in Casablanca"
              />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="subtitleFr">
                Description (français)
              </label>
              <textarea
                id="subtitleFr"
                className="a-textarea"
                rows={3}
                value={form.subtitleFr}
                onChange={setField('subtitleFr')}
                placeholder="Cours de kung-fu et tai-chi pour tous les âges."
                style={{ minHeight: 90 }}
              />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="subtitleEn">
                Description (anglais)
              </label>
              <textarea
                id="subtitleEn"
                className="a-textarea"
                rows={3}
                value={form.subtitleEn}
                onChange={setField('subtitleEn')}
                placeholder="Kung fu and tai chi classes for all ages."
                style={{ minHeight: 90 }}
              />
            </div>
          </div>

          <p className="a-hint">
            Un titre ou une description laissé vide retombe sur le texte par défaut
            du site (traduit automatiquement).
          </p>

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
                Diapositive active (visible sur le site)
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
      ) : banners.length === 0 ? (
        <div className="a-empty">
          Aucune diapositive. La page d’accueil affiche l’image hero unique par
          défaut. Ajoutez une diapositive pour activer le diaporama.
        </div>
      ) : (
        <div className="a-tableWrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Diapositive</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="a-thumb"
                        src={b.image}
                        alt=""
                        style={{ width: 96, height: 54 }}
                      />
                      <div>
                        <span className="a-rowTitle">{b.titleFr || '—'}</span>
                        {b.subtitleFr && <span className="a-rowMeta">{b.subtitleFr}</span>}
                      </div>
                    </div>
                  </td>
                  <td>{b.order ?? 0}</td>
                  <td>
                    {b.active !== false ? (
                      <span className="a-badge a-badge-published">Active</span>
                    ) : (
                      <span className="a-badge a-badge-draft">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="a-actions">
                      <button className="a-btn" onClick={() => openEdit(b)}>
                        Modifier
                      </button>
                      <button className="a-btn a-btn-danger" onClick={() => remove(b)}>
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
