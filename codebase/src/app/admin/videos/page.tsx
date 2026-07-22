'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import type { Video } from '@/lib/videos';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .listVideos()
      .then(setVideos)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Vidéos</h1>
          <p className="a-sub">
            {videos
              ? `${videos.length} vidéo(s) — section « L’académie en mouvement » de l’accueil.`
              : 'Chargement…'}
          </p>
        </div>
        <Link href="/admin/videos/new" className="a-btn a-btn-primary">
          Nouvelle vidéo
        </Link>
      </div>

      {error && (
        <div className="a-alert a-alert-error" role="alert">
          {error}
        </div>
      )}

      {videos && videos.length === 0 ? (
        <div className="a-card a-empty">
          Aucune vidéo pour l’instant.{' '}
          <Link href="/admin/videos/new">Ajouter la première</Link>.
        </div>
      ) : videos ? (
        <div className="a-tableWrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Vidéo</th>
                <th style={{ width: 90 }}>Ordre</th>
                <th style={{ width: 130 }}>Statut</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id}>
                  <td>
                    <Link href={`/admin/videos/edit?id=${v.id}`} className="a-rowTitle">
                      {v.title}
                    </Link>
                    {v.description && <span className="a-rowMeta">{v.description}</span>}
                  </td>
                  <td>{v.order}</td>
                  <td>
                    <span className={`a-badge a-badge-${v.status}`}>
                      {v.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/videos/edit?id=${v.id}`} className="a-btn">
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
