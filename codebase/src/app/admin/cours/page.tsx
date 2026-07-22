'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import AdminShell from '@/components/admin/AdminShell';

type ProgramRow = {
  id: string;
  slug: string;
  name: string;
  order?: number;
  status?: 'draft' | 'published';
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<ProgramRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .listPrograms()
      .then(setPrograms)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Cours</h1>
          <p className="a-sub">
            {programs ? `${programs.length} cours au total.` : 'Chargement…'}
          </p>
        </div>
        <Link href="/admin/cours/new" className="a-btn a-btn-primary">
          Nouveau cours
        </Link>
      </div>

      {error && (
        <div className="a-alert a-alert-error" role="alert">
          {error}
        </div>
      )}

      {programs && programs.length === 0 ? (
        <div className="a-card a-empty">
          Aucun cours pour l’instant.{' '}
          <Link href="/admin/cours/new">Ajouter le premier</Link>.
        </div>
      ) : programs ? (
        <div className="a-tableWrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Cours</th>
                <th style={{ width: 90 }}>Ordre</th>
                <th style={{ width: 130 }}>Statut</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/cours/edit?id=${p.id}`} className="a-rowTitle">
                      {p.name}
                    </Link>
                    <span className="a-rowMeta">/{p.slug}</span>
                  </td>
                  <td>{p.order}</td>
                  <td>
                    <span className={`a-badge a-badge-${p.status}`}>
                      {p.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/cours/edit?id=${p.id}`} className="a-btn">
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
