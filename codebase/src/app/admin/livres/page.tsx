'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import type { Book } from '@/lib/books';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .listBooks()
      .then(setBooks)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Livres recommandés</h1>
          <p className="a-sub">
            {books ? `${books.length} livre(s) au total.` : 'Chargement…'}
          </p>
        </div>
        <Link href="/admin/livres/new" className="a-btn a-btn-primary">
          Nouveau livre
        </Link>
      </div>

      {error && (
        <div className="a-alert a-alert-error" role="alert">
          {error}
        </div>
      )}

      {books && books.length === 0 ? (
        <div className="a-card a-empty">
          Aucun livre pour l’instant.{' '}
          <Link href="/admin/livres/new">Ajouter le premier</Link>.
        </div>
      ) : books ? (
        <div className="a-tableWrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Livre</th>
                <th style={{ width: 140 }}>Catégorie</th>
                <th style={{ width: 90 }}>Ordre</th>
                <th style={{ width: 130 }}>Statut</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href={`/admin/livres/edit?id=${b.id}`} className="a-rowTitle">
                      {b.title}
                    </Link>
                    <span className="a-rowMeta">{b.author}</span>
                  </td>
                  <td>{b.category || '—'}</td>
                  <td>{b.order}</td>
                  <td>
                    <span className={`a-badge a-badge-${b.status}`}>
                      {b.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/livres/edit?id=${b.id}`} className="a-btn">
                      Modifier
                    </Link>
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
