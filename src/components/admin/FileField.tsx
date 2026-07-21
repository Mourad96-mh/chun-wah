'use client';

import { useRef, useState } from 'react';

/**
 * Optional downloadable file (PDF or hi-res image). Uploads to Cloudinary via
 * /api/admin/upload/doc when configured; the client can always paste a URL, so
 * the admin stays usable without keys and for files above the 4 Mo route limit.
 */
export default function FileField({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(file: File) {
    setError('');
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload/doc', { method: 'POST', body: form });
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
      <label className="a-label" htmlFor="file-url">
        {label}
        {hint && <span className="a-hint"> — {hint}</span>}
      </label>

      <input
        id="file-url"
        type="url"
        className="a-input"
        placeholder="https://… ou téléversez un fichier"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="a-actions" style={{ marginTop: '0.5rem' }}>
        <button
          type="button"
          className="a-btn"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Envoi…' : 'Téléverser un fichier'}
        </button>
        {value && (
          <>
            <a className="a-btn" href={value} target="_blank" rel="noopener noreferrer">
              Ouvrir
            </a>
            <button type="button" className="a-btn a-btn-danger" onClick={() => onChange('')}>
              Retirer
            </button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />

      {error && (
        <div className="a-alert a-alert-error" role="alert" style={{ marginTop: '0.5rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}
