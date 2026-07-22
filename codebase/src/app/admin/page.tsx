'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/adminApi';
import type { ArticleCard } from '@/lib/articles';
import type { Book } from '@/lib/books';
import type { Video } from '@/lib/videos';
import AdminShell from '@/components/admin/AdminShell';

// Le tableau de bord compte désormais côté client, à partir des listes admin de
// l'API (plus de countDocuments Mongo) : les volumes sont petits et cela évite
// des endpoints d'agrégation dédiés.
export default function AdminDashboard() {
  const [articles, setArticles] = useState<ArticleCard[] | null>(null);
  const [books, setBooks] = useState<Book[] | null>(null);
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminApi.listArticles(), adminApi.listBooks(), adminApi.listVideos()])
      .then(([a, b, v]) => {
        setArticles(a);
        setBooks(b);
        setVideos(v);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const count = <T extends { status?: string }>(
    list: T[] | null,
    status: 'published' | 'draft',
  ) => (list ? list.filter((x) => x.status === status).length : '…');

  // Les 5 derniers articles modifiés (l'API renvoie createdAt/updatedAt).
  const recent = (articles ?? [])
    .slice()
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    .slice(0, 5);

  return (
    <AdminShell>
      <div className="a-head">
        <div>
          <h1>Tableau de bord</h1>
          <p className="a-sub">Gérez le blog et les recommandations de lecture.</p>
        </div>
        <div className="a-actions">
          <Link href="/admin/cours/new" className="a-btn a-btn-primary">
            Nouveau cours
          </Link>
          <Link href="/admin/articles/new" className="a-btn a-btn-primary">
            Nouvel article
          </Link>
          <Link href="/admin/livres/new" className="a-btn">
            Nouveau livre
          </Link>
          <Link href="/admin/videos/new" className="a-btn">
            Nouvelle vidéo
          </Link>
          <Link href="/admin/parcours" className="a-btn">
            Parcours
          </Link>
          <Link href="/admin/medias" className="a-btn">
            Images du site
          </Link>
          <Link href="/admin/reglages" className="a-btn">
            Réglages du menu
          </Link>
        </div>
      </div>

      {error && (
        <div className="a-alert a-alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="a-cards">
        <div className="a-card">
          <div className="a-stat">{count(articles, 'published')}</div>
          <div className="a-statLabel">articles publiés</div>
        </div>
        <div className="a-card">
          <div className="a-stat">{count(articles, 'draft')}</div>
          <div className="a-statLabel">brouillons</div>
        </div>
        <div className="a-card">
          <div className="a-stat">{count(books, 'published')}</div>
          <div className="a-statLabel">livres publiés</div>
        </div>
        <div className="a-card">
          <div className="a-stat">{count(books, 'draft')}</div>
          <div className="a-statLabel">livres en brouillon</div>
        </div>
        <div className="a-card">
          <div className="a-stat">{count(videos, 'published')}</div>
          <div className="a-statLabel">vidéos publiées</div>
        </div>
      </div>

      <h2>Dernières modifications</h2>
      {!articles ? (
        <p className="a-sub">Chargement…</p>
      ) : recent.length === 0 ? (
        <div className="a-card a-empty">
          Aucun article pour l’instant.{' '}
          <Link href="/admin/articles/new">Écrire le premier</Link>.
        </div>
      ) : (
        <div className="a-tableWrap">
          <table className="a-table">
            <tbody>
              {recent.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/articles/edit?id=${a.id}`} className="a-rowTitle">
                      {a.title}
                    </Link>
                  </td>
                  <td style={{ width: 120 }}>
                    <span className={`a-badge a-badge-${a.status}`}>
                      {a.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
