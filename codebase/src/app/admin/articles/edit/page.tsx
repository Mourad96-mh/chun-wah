'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import AdminShell from '@/components/admin/AdminShell';
import ArticleEditor, { type ArticleFormValues } from '@/components/admin/ArticleEditor';

// Édition par ?id=… plutôt qu'une route dynamique /[id] : en export statique,
// une route dynamique exigerait de connaître tous les ids au build. La page est
// statique ; l'id est lu dans la query côté client, l'article chargé via l'API.
function EditArticleInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const [values, setValues] = useState<ArticleFormValues | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Article introuvable (id manquant).');
      return;
    }
    adminApi
      .getArticle(id)
      .then((a) =>
        setValues({
          id: a.id,
          title: a.title ?? '',
          slug: a.slug ?? '',
          excerpt: a.excerpt ?? '',
          body: a.body ?? '',
          coverImage: a.coverImage ?? '',
          coverAlt: a.coverAlt ?? '',
          tags: a.tags ?? [],
          author: a.author ?? '',
          status: a.status === 'published' ? 'published' : 'draft',
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
  return <ArticleEditor initial={values} />;
}

export default function EditArticlePage() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="a-sub">Chargement…</p>}>
        <EditArticleInner />
      </Suspense>
    </AdminShell>
  );
}
