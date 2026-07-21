'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import type { ArticleCard } from '@/lib/articles';
import AdminShell from '@/components/admin/AdminShell';

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleCard[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .listArticles()
      .then(setArticles)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Articles</h1>
          <p className="a-sub">
            {articles ? `${articles.length} article(s) au total.` : 'Chargement…'}
          </p>
        </div>
        <Link href="/admin/articles/new" className="a-btn a-btn-primary">
          Nouvel article
        </Link>
      </div>

      {error && (
        <div className="a-alert a-alert-error" role="alert">
          {error}
        </div>
      )}

      {articles && articles.length === 0 ? (
        <div className="a-card a-empty">
          Aucun article pour l’instant.{' '}
          <Link href="/admin/articles/new">Écrire le premier</Link>.
        </div>
      ) : articles ? (
        <div className="a-tableWrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th style={{ width: 130 }}>Statut</th>
                <th style={{ width: 150 }}>Modifié le</th>
                <th style={{ width: 170 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/articles/edit?id=${a.id}`} className="a-rowTitle">
                      {a.title}
                    </Link>
                    <span className="a-rowMeta">/blog/{a.slug}</span>
                  </td>
                  <td>
                    <span className={`a-badge a-badge-${a.status}`}>
                      {a.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td>{a.updatedAt ? dateFmt.format(new Date(a.updatedAt)) : '—'}</td>
                  <td>
                    <div className="a-actions">
                      <Link href={`/admin/articles/edit?id=${a.id}`} className="a-btn">
                        Modifier
                      </Link>
                      {a.status === 'published' && (
                        <Link href={`/fr/blog/${a.slug}`} target="_blank" className="a-btn">
                          Voir ↗
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AdminShell>
  );
}
