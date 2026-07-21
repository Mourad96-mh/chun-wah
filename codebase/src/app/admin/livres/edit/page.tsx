'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import AdminShell from '@/components/admin/AdminShell';
import BookEditor, { type BookFormValues } from '@/components/admin/BookEditor';

// Édition par ?id=… (route statique) plutôt qu'une route dynamique /[id],
// impossible en export statique. Même pattern que /admin/articles/edit.
function EditBookInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const [values, setValues] = useState<BookFormValues | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Livre introuvable (id manquant).');
      return;
    }
    adminApi
      .getBook(id)
      .then((b) =>
        setValues({
          id: b.id,
          title: b.title ?? '',
          author: b.author ?? '',
          recommendation: b.recommendation ?? '',
          coverImage: b.coverImage ?? '',
          level: b.level ?? '',
          category: b.category ?? '',
          order: typeof b.order === 'number' ? b.order : 100,
          status: b.status === 'published' ? 'published' : 'draft',
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
  return <BookEditor initial={values} />;
}

export default function EditBookPage() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="a-sub">Chargement…</p>}>
        <EditBookInner />
      </Suspense>
    </AdminShell>
  );
}
