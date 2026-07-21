'use client';

import { useRef, useState } from 'react';

/**
 * Cover image picker. Uploads to Cloudinary when configured; otherwise the
 * client can still paste a URL, so the admin stays usable without keys.
 */
export default function ImageField({
  value,
  onChange,
  label = 'Image de couverture',
  id = 'cover-url',
  hint = '1200×630 recommandé pour le partage',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Unique id so several ImageFields can share a page without duplicate ids. */
  id?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(file: File) {
    setError('');
    setBusy(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Échec de l'upload.");
        return;
      }

      onChange(data.url);
    } catch {
      setError('Erreur réseau pendant l’upload.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="a-field">
      <label className="a-label" htmlFor={id}>
        {label}
        {hint && <span className="a-hint"> — {hint}</span>}
      </label>

      <div className="a-imageRow">
        {/* Admin preview of an arbitrary URL: next/image would need every host
            whitelisted, so a plain img is the right call here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="a-thumb"
          src={value || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>'}
          alt=""
        />

        <div style={{ flex: 1, display: 'grid', gap: '0.5rem' }}>
          <input
            id={id}
            type="url"
            className="a-input"
            placeholder="https://… ou téléversez un fichier"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />

          <div className="a-actions">
            <button
              type="button"
              className="a-btn"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? 'Envoi…' : 'Téléverser une image'}
            </button>
            {value && (
              <button type="button" className="a-btn a-btn-danger" onClick={() => onChange('')}>
                Retirer
              </button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
          />

          {error && (
            <div className="a-alert a-alert-error" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
