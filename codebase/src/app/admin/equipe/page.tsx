'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import ImageField from '@/components/admin/ImageField';
import { adminApi } from '@/lib/adminApi';

type AdminMember = {
  _id: string;
  name: string;
  roleFr?: string;
  roleEn?: string;
  bioFr?: string;
  bioEn?: string;
  image?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  order?: number;
  active?: boolean;
};

type FormState = {
  name: string;
  roleFr: string;
  roleEn: string;
  bioFr: string;
  bioEn: string;
  image: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  order: string;
  active: boolean;
};

const empty: FormState = {
  name: '',
  roleFr: '',
  roleEn: '',
  bioFr: '',
  bioEn: '',
  image: '',
  facebook: '',
  instagram: '',
  youtube: '',
  tiktok: '',
  order: '',
  active: true,
};

function toForm(m: AdminMember): FormState {
  return {
    name: m.name ?? '',
    roleFr: m.roleFr ?? '',
    roleEn: m.roleEn ?? '',
    bioFr: m.bioFr ?? '',
    bioEn: m.bioEn ?? '',
    image: m.image ?? '',
    facebook: m.facebook ?? '',
    instagram: m.instagram ?? '',
    youtube: m.youtube ?? '',
    tiktok: m.tiktok ?? '',
    order: m.order != null ? String(m.order) : '',
    active: m.active !== false,
  };
}

function toPayload(f: FormState) {
  return {
    name: f.name.trim(),
    roleFr: f.roleFr.trim(),
    roleEn: f.roleEn.trim(),
    bioFr: f.bioFr.trim(),
    bioEn: f.bioEn.trim(),
    image: f.image.trim(),
    facebook: f.facebook.trim(),
    instagram: f.instagram.trim(),
    youtube: f.youtube.trim(),
    tiktok: f.tiktok.trim(),
    order: f.order ? Number(f.order) : 0,
    active: f.active,
  };
}

export default function TeamAdmin() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.listTeam();
      setMembers(Array.isArray(data) ? data : []);
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

  function openEdit(m: AdminMember) {
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
    if (!form.name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setSaving(true);
    try {
      if (editingId === 'new') {
        await adminApi.createTeamMember(toPayload(form));
      } else if (editingId) {
        await adminApi.updateTeamMember(editingId, toPayload(form));
      }
      close();
      await load();
    } catch (err) {
      setError((err as Error).message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function remove(m: AdminMember) {
    if (!confirm(`Supprimer « ${m.name} » ?`)) return;
    setError('');
    try {
      await adminApi.deleteTeamMember(m._id);
      await load();
    } catch (err) {
      setError((err as Error).message || 'Échec de la suppression');
    }
  }

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Équipe</h1>
          <p className="a-sub">
            Les membres affichés sur la page « Équipe » (instructeurs et
            encadrants). Chaque membre a une photo, un nom, un rôle et une bio en
            français et en anglais, plus des liens sociaux facultatifs.
          </p>
        </div>
        {!editingId && (
          <button className="a-btn a-btn-primary" onClick={openNew}>
            + Nouveau membre
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
          <h2>{editingId === 'new' ? 'Nouveau membre' : 'Modifier le membre'}</h2>

          <div className="a-field">
            <label className="a-label" htmlFor="name">
              Nom *
            </label>
            <input
              id="name"
              className="a-input"
              value={form.name}
              onChange={setField('name')}
              placeholder="Sifu Ahmed Benali"
            />
          </div>

          <ImageField
            id="member-image"
            label="Photo (portrait)"
            hint="Format portrait (~3:4). Une photo sur le tapis vaut mieux qu'un studio."
            folder="chunwah/team"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="roleFr">
                Rôle / grade (français)
              </label>
              <input id="roleFr" className="a-input" value={form.roleFr} onChange={setField('roleFr')} placeholder="Fondateur & instructeur principal" />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="roleEn">
                Rôle / grade (anglais)
              </label>
              <input id="roleEn" className="a-input" value={form.roleEn} onChange={setField('roleEn')} placeholder="Founder & head instructor" />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="bioFr">
                Bio (français)
              </label>
              <textarea id="bioFr" className="a-textarea" rows={4} value={form.bioFr} onChange={setField('bioFr')} placeholder="Quelques lignes de présentation…" />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="bioEn">
                Bio (anglais)
              </label>
              <textarea id="bioEn" className="a-textarea" rows={4} value={form.bioEn} onChange={setField('bioEn')} placeholder="A few lines of introduction…" />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="facebook">Facebook (URL)</label>
              <input id="facebook" className="a-input" value={form.facebook} onChange={setField('facebook')} placeholder="https://facebook.com/…" />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="instagram">Instagram (URL)</label>
              <input id="instagram" className="a-input" value={form.instagram} onChange={setField('instagram')} placeholder="https://instagram.com/…" />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="youtube">YouTube (URL)</label>
              <input id="youtube" className="a-input" value={form.youtube} onChange={setField('youtube')} placeholder="https://youtube.com/@…" />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="tiktok">TikTok (URL)</label>
              <input id="tiktok" className="a-input" value={form.tiktok} onChange={setField('tiktok')} placeholder="https://tiktok.com/@…" />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="order">
                Ordre d’affichage <span className="a-hint">— plus petit = plus tôt</span>
              </label>
              <input id="order" type="number" className="a-input" value={form.order} onChange={setField('order')} placeholder="0" />
            </div>
            <div className="a-field">
              <label className="a-label">Statut</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.4rem' }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                Membre actif (visible sur le site)
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
      ) : members.length === 0 ? (
        <div className="a-empty">
          Aucun membre. La page « Équipe » affiche le roster par défaut jusqu’à ce
          que vous ajoutiez des membres ici.
        </div>
      ) : (
        <div className="a-tableWrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="a-thumb" src={m.image || undefined} alt="" style={{ width: 54, height: 68 }} />
                      <div>
                        <span className="a-rowTitle">{m.name}</span>
                        {m.roleFr && <span className="a-rowMeta">{m.roleFr}</span>}
                      </div>
                    </div>
                  </td>
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
