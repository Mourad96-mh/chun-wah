'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import AdminShell from '@/components/admin/AdminShell';
import VideoEditor, { type VideoFormValues } from '@/components/admin/VideoEditor';

// Édition par ?id=… (route statique) plutôt qu'une route dynamique /[id],
// impossible en export statique. Même pattern que /admin/livres/edit.
function EditVideoInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const [values, setValues] = useState<VideoFormValues | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Vidéo introuvable (id manquant).');
      return;
    }
    adminApi
      .getVideo(id)
      .then((v) =>
        setValues({
          id: v.id,
          title: v.title ?? '',
          description: v.description ?? '',
          videoUrl: v.videoUrl ?? '',
          poster: v.poster ?? '',
          order: typeof v.order === 'number' ? v.order : 100,
          status: v.status === 'published' ? 'published' : 'draft',
        }),
      )
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="a-alert a-alert-error" role="alert">
        {error}
      </div>
    );
  }
  if (!values) return <p className="a-sub">Chargement…</p>;
  return <VideoEditor initial={values} />;
}

export default function EditVideoPage() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="a-sub">Chargement…</p>}>
        <EditVideoInner />
      </Suspense>
    </AdminShell>
  );
}
