'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { MEDIA_SLOTS } from '@/lib/media';
import AdminShell from '@/components/admin/AdminShell';
import MediaManager from '@/components/admin/MediaManager';

type Item = { url: string; alt: string; name: string };

export default function AdminMediaPage() {
  const [initial, setInitial] = useState<Record<string, Item> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getMedia()
      .then((m) => {
        const map: Record<string, Item> = {};
        for (const it of Array.isArray(m?.items) ? m.items : []) {
          map[it.slot] = { url: it.url ?? '', alt: it.alt ?? '', name: it.name ?? '' };
        }
        setInitial(map);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <AdminShell>
      {error && (
        <div className="a-alert a-alert-error" role="alert">
          {error}
        </div>
      )}
      {initial ? (
        <MediaManager slots={MEDIA_SLOTS} initial={initial} />
      ) : (
        !error && <p className="a-sub">Chargement…</p>
      )}
    </AdminShell>
  );
}
