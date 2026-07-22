'use client';

import { useRef, useState } from 'react';
import { adminApi } from '@/lib/adminApi';

const MAX_BYTES = 100 * 1024 * 1024; // Cloudinary free tier caps a video at 100 Mo.
const ACCEPT = 'video/mp4,video/webm,video/quicktime';

/**
 * Video picker. Uploads the file straight to Cloudinary using a signature from
 * l'API Express (/api/uploads/sign), so a 100 Mo clip never transits through
 * the API, with a progress bar. The client can also paste any direct URL/path —
 * e.g. a self-hosted `/videos/demo.mp4` — so the admin stays usable without keys.
 */
export default function VideoField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function upload(file: File) {
    setError('');

    if (file.size > MAX_BYTES) {
      setError('Vidéo trop lourde (100 Mo maximum). Compressez-la avant de l’envoyer.');
      return;
    }

    let sign: {
      timestamp: number;
      folder: string;
      signature: string;
      apiKey: string;
      cloudName: string;
    };
    try {
      sign = await adminApi.uploadSignature();
    } catch (err) {
      setError((err as Error).message || "Échec de la préparation de l'upload.");
      return;
    }

    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sign.apiKey);
    form.append('timestamp', String(sign.timestamp));
    form.append('folder', sign.folder);
    form.append('signature', sign.signature);

    setProgress(0);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          'POST',
          `https://api.cloudinary.com/v1_1/${sign.cloudName}/video/upload`,
        );
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText).secure_url);
          } else {
            reject(new Error('upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('network error'));
        xhr.send(form);
      });
      onChange(url);
    } catch {
      setError("Échec de l'upload de la vidéo.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const busy = progress !== null;

  return (
    <div className="a-field">
      <label className="a-label" htmlFor="video-url">
        Fichier vidéo
        <span className="a-hint"> — MP4 conseillé, gardez les clips courts et légers</span>
      </label>

      {value && (
        <video
          src={value}
          controls
          preload="metadata"
          style={{ width: '100%', maxWidth: 420, borderRadius: 8, marginBottom: '0.75rem', background: '#000' }}
        />
      )}

      <input
        id="video-url"
        type="url"
        className="a-input"
        placeholder="https://… ou /videos/mon-clip.mp4"
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
          {busy ? `Envoi… ${progress}%` : 'Téléverser une vidéo'}
        </button>
        {value && !busy && (
          <button type="button" className="a-btn a-btn-danger" onClick={() => onChange('')}>
            Retirer
          </button>
        )}
      </div>

      {busy && (
        <div
          aria-hidden="true"
          style={{ height: 6, borderRadius: 3, background: 'var(--line, #ddd)', marginTop: '0.5rem', overflow: 'hidden' }}
        >
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent, #487E20)', transition: 'width .2s' }} />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
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
