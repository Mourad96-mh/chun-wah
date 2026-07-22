'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import ImageField from './ImageField';
import type { MediaSlot } from '@/lib/media';

interface Item {
  url: string;
  alt: string;
  name: string;
}

/** Instructor slots (key `instructor:<slug>`) also expose a display-name field. */
const isInstructorSlot = (key: string) => key.startsWith('instructor:');

/**
 * Manages the client-uploadable vitrine images (hero, à propos, instructor
 * portraits). Images save the moment they're uploaded/removed; alt text saves on
 * blur (so we don't PUT on every keystroke). The whole slot map is sent each
 * time — the API replaces it wholesale — so there are no partial-write races.
 */
export default function MediaManager({
  slots,
  initial,
}: {
  slots: MediaSlot[];
  initial: Record<string, Item>;
}) {
  const [items, setItems] = useState<Record<string, Item>>(() => {
    const base: Record<string, Item> = {};
    for (const s of slots) {
      base[s.key] = {
        url: initial[s.key]?.url ?? '',
        alt: initial[s.key]?.alt ?? '',
        name: initial[s.key]?.name ?? '',
      };
    }
    return base;
  });
  const [error, setError] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  async function persist(next: Record<string, Item>, key: string, previous: Record<string, Item>) {
    setError('');
    setSavedKey(null);
    setSavingKey(key);
    try {
      // Toute la carte est renvoyée à chaque fois — l'API la remplace en bloc,
      // donc aucune course d'écriture partielle.
      const payload = Object.entries(next).map(([slot, v]) => ({
        slot,
        url: v.url,
        alt: v.alt,
        name: v.name,
      }));
      await adminApi.updateMedia(payload);
      setSavedKey(key);
    } catch (err) {
      const e = err as Error & { status?: number };
      setItems(previous); // roll back so the UI never lies about what's saved
      setError(
        e.status === 401
          ? 'Session expirée — reconnectez-vous, puis réessayez.'
          : e.message || 'Enregistrement impossible. Réessayez.',
      );
    } finally {
      setSavingKey(null);
    }
  }

  /** Image changes (upload / paste / remove) save immediately. */
  function setUrl(key: string, url: string) {
    const previous = items;
    const next = { ...items, [key]: { ...items[key], url } };
    setItems(next);
    void persist(next, key, previous);
  }

  /** Text edits (alt, name) are local until blur, to avoid a request per keystroke. */
  function setFieldLocal(key: string, patch: Partial<Item>) {
    setItems((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    setSavedKey(null);
  }

  function saveField(key: string) {
    void persist(items, key, items);
  }

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Images du site</h1>
          <p className="a-sub">
            Téléversez les photos de l’accueil et des instructeurs. Tant qu’une
            image n’est pas fournie, un cadre « Photo à fournir » s’affiche à sa
            place sur le site. Les changements sont enregistrés automatiquement.
          </p>
        </div>
      </div>

      {error && (
        <div className="a-alert a-alert-error" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="a-grid" style={{ display: 'grid', gap: '1rem' }}>
        {slots.map((slot) => {
          const item = items[slot.key];
          const saving = savingKey === slot.key;
          const saved = savedKey === slot.key;
          return (
            <div key={slot.key} className="a-card a-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                <strong>{slot.label}</strong>
                <span className="a-hint">
                  {saving ? 'Enregistrement…' : saved ? 'Enregistré ✓' : item.url ? 'Image en ligne' : 'Aucune image'}
                </span>
              </div>

              {isInstructorSlot(slot.key) && (
                <div className="a-field">
                  <label className="a-label" htmlFor={`name-${slot.key}`}>
                    Nom de l’instructeur
                    <span className="a-hint"> — affiché sur le site ; laissez vide pour garder le nom par défaut</span>
                  </label>
                  <input
                    id={`name-${slot.key}`}
                    className="a-input"
                    value={item.name}
                    maxLength={120}
                    onChange={(e) => setFieldLocal(slot.key, { name: e.target.value })}
                    onBlur={() => saveField(slot.key)}
                    placeholder="Ex. : Sifu Ahmed Benali"
                  />
                </div>
              )}

              <ImageField
                id={`media-${slot.key}`}
                label="Fichier image"
                hint={slot.hint}
                value={item.url}
                onChange={(url) => setUrl(slot.key, url)}
                folder="chunwah/medias"
              />

              <div className="a-field">
                <label className="a-label" htmlFor={`alt-${slot.key}`}>
                  Texte alternatif
                  <span className="a-hint"> — décrit l’image (accessibilité &amp; SEO) ; laissez vide pour garder le texte par défaut</span>
                </label>
                <input
                  id={`alt-${slot.key}`}
                  className="a-input"
                  value={item.alt}
                  maxLength={300}
                  onChange={(e) => setFieldLocal(slot.key, { alt: e.target.value })}
                  onBlur={() => saveField(slot.key)}
                  placeholder="Ex. : Sifu pendant une démonstration de Wing Chun"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
