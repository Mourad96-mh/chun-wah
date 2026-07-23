'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import ImageField from '@/components/admin/ImageField';
import { adminApi } from '@/lib/adminApi';

type AdminEvent = {
  _id: string;
  image?: string;
  titleFr?: string;
  titleEn?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  date?: string;
  endDate?: string;
  time?: string;
  location?: string;
  active?: boolean;
};

type FormState = {
  image: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  date: string;
  endDate: string;
  time: string;
  location: string;
  active: boolean;
};

const empty: FormState = {
  image: '',
  titleFr: '',
  titleEn: '',
  descriptionFr: '',
  descriptionEn: '',
  date: '',
  endDate: '',
  time: '',
  location: '',
  active: true,
};

function toForm(ev: AdminEvent): FormState {
  return {
    image: ev.image ?? '',
    titleFr: ev.titleFr ?? '',
    titleEn: ev.titleEn ?? '',
    descriptionFr: ev.descriptionFr ?? '',
    descriptionEn: ev.descriptionEn ?? '',
    date: ev.date ?? '',
    endDate: ev.endDate ?? '',
    time: ev.time ?? '',
    location: ev.location ?? '',
    active: ev.active !== false,
  };
}

function toPayload(f: FormState) {
  return {
    image: f.image.trim(),
    titleFr: f.titleFr.trim(),
    titleEn: f.titleEn.trim(),
    descriptionFr: f.descriptionFr.trim(),
    descriptionEn: f.descriptionEn.trim(),
    date: f.date.trim(),
    endDate: f.endDate.trim(),
    time: f.time.trim(),
    location: f.location.trim(),
    active: f.active,
  };
}

export default function EventsAdmin() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.listEvents();
      setEvents(Array.isArray(data) ? data : []);
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

  function openEdit(ev: AdminEvent) {
    setForm(toForm(ev));
    setEditingId(ev._id);
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
    if (!form.date.trim()) {
      setError('La date est requise.');
      return;
    }
    if (!form.titleFr.trim() && !form.titleEn.trim()) {
      setError('Un titre (français ou anglais) est requis.');
      return;
    }
    setSaving(true);
    try {
      if (editingId === 'new') {
        await adminApi.createEvent(toPayload(form));
      } else if (editingId) {
        await adminApi.updateEvent(editingId, toPayload(form));
      }
      close();
      await load();
    } catch (err) {
      setError((err as Error).message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function remove(ev: AdminEvent) {
    if (!confirm(`Supprimer « ${ev.titleFr || ev.titleEn || ev._id} » ?`)) return;
    setError('');
    try {
      await adminApi.deleteEvent(ev._id);
      await load();
    } catch (err) {
      setError((err as Error).message || 'Échec de la suppression');
    }
  }

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Événements</h1>
          <p className="a-sub">
            Les événements affichés sur la page « Événements » (stages,
            compétitions, passages de grade, séminaires). Chaque événement a une
            date, un titre et une description en français et en anglais, et un lieu.
          </p>
        </div>
        {!editingId && (
          <button className="a-btn a-btn-primary" onClick={openNew}>
            + Nouvel événement
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
          <h2>{editingId === 'new' ? 'Nouvel événement' : "Modifier l'événement"}</h2>

          <ImageField
            id="event-image"
            label="Image de couverture"
            hint="Format paysage (~16:9)."
            folder="chunwah/events"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="titleFr">Titre (français)</label>
              <input id="titleFr" className="a-input" value={form.titleFr} onChange={setField('titleFr')} placeholder="Stage de Wing Chun" />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="titleEn">Titre (anglais)</label>
              <input id="titleEn" className="a-input" value={form.titleEn} onChange={setField('titleEn')} placeholder="Wing Chun seminar" />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="descriptionFr">Description (français)</label>
              <textarea id="descriptionFr" className="a-textarea" rows={3} value={form.descriptionFr} onChange={setField('descriptionFr')} placeholder="De quoi s'agit-il, pour qui…" />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="descriptionEn">Description (anglais)</label>
              <textarea id="descriptionEn" className="a-textarea" rows={3} value={form.descriptionEn} onChange={setField('descriptionEn')} placeholder="What it is, who it's for…" />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="date">Date de début *</label>
              <input id="date" type="date" className="a-input" value={form.date} onChange={setField('date')} />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="endDate">Date de fin <span className="a-hint">— facultative</span></label>
              <input id="endDate" type="date" className="a-input" value={form.endDate} onChange={setField('endDate')} />
            </div>
          </div>

          <div className="a-grid2">
            <div className="a-field">
              <label className="a-label" htmlFor="time">Heure <span className="a-hint">— facultative</span></label>
              <input id="time" type="time" className="a-input" value={form.time} onChange={setField('time')} />
            </div>
            <div className="a-field">
              <label className="a-label" htmlFor="location">Lieu</label>
              <input id="location" className="a-input" value={form.location} onChange={setField('location')} placeholder="Dojo Chun Wah, Casablanca" />
            </div>
          </div>

          <div className="a-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Événement actif (visible sur le site)
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
      ) : events.length === 0 ? (
        <div className="a-empty">
          Aucun événement. La page « Événements » affiche un message d’attente
          jusqu’à ce que vous en ajoutiez un.
        </div>
      ) : (
        <div className="a-tableWrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Événement</th>
                <th>Date</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="a-thumb" src={ev.image || undefined} alt="" style={{ width: 80, height: 48 }} />
                      <div>
                        <span className="a-rowTitle">{ev.titleFr || ev.titleEn || '—'}</span>
                        {ev.location && <span className="a-rowMeta">{ev.location}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    {ev.date || '—'}
                    {ev.time ? ` · ${ev.time}` : ''}
                  </td>
                  <td>
                    {ev.active !== false ? (
                      <span className="a-badge a-badge-published">Actif</span>
                    ) : (
                      <span className="a-badge a-badge-draft">Inactif</span>
                    )}
                  </td>
                  <td>
                    <div className="a-actions">
                      <button className="a-btn" onClick={() => openEdit(ev)}>Modifier</button>
                      <button className="a-btn a-btn-danger" onClick={() => remove(ev)}>Supprimer</button>
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
