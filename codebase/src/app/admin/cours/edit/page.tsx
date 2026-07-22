'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import AdminShell from '@/components/admin/AdminShell';
import ProgramEditor, { type ProgramFormValues } from '@/components/admin/ProgramEditor';

// Édition par ?id=… (route statique) plutôt qu'une route dynamique /[id],
// impossible en export statique. Même pattern que /admin/articles/edit.
function EditProgramInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const [values, setValues] = useState<ProgramFormValues | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Cours introuvable (id manquant).');
      return;
    }
    adminApi
      .getProgram(id)
      .then((p) =>
        setValues({
          id: p.id,
          name: p.name ?? '',
          slug: p.slug ?? '',
          order: typeof p.order === 'number' ? p.order : 100,
          tagline: p.tagline ?? '',
          intro: p.intro ?? '',
          benefits: Array.isArray(p.benefits) ? p.benefits.join('\n') : '',
          ageRange: p.ageRange ?? '',
          level: p.level ?? '',
          duration: p.duration ?? '',
          image: p.image ?? '',
          imageAlt: p.imageAlt ?? '',
          status: p.status === 'published' ? 'published' : 'draft',
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
  return <ProgramEditor initial={values} />;
}

export default function EditProgramPage() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="a-sub">Chargement…</p>}>
        <EditProgramInner />
      </Suspense>
    </AdminShell>
  );
}
