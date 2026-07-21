import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Video } from '@/models/Video';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminVideosPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  await dbConnect();
  const videos = await Video.find({}).sort({ order: 1, createdAt: -1 }).lean();

  return (
    <AdminShell userName={session.name || session.email}>
      <div className="a-head">
        <div>
          <h1>Vidéos</h1>
          <p className="a-sub">
            {videos.length} vidéo(s) — section « L’académie en mouvement » de l’accueil.
          </p>
        </div>
        <Link href="/admin/videos/new" className="a-btn a-btn-primary">
          Nouvelle vidéo
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="a-card a-empty">
          Aucune vidéo pour l’instant.{' '}
          <Link href="/admin/videos/new">Ajouter la première</Link>.
        </div>
      ) : (
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
                <tr key={String(v._id)}>
                  <td>
                    <Link href={`/admin/videos/${v._id}`} className="a-rowTitle">
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
                    <Link href={`/admin/videos/${v._id}`} className="a-btn">
                      Modifier
                    </Link>
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
