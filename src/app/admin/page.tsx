import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Article } from '@/models/Article';
import { Book } from '@/models/Book';
import { Video } from '@/models/Video';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  await dbConnect();

  const [publishedArticles, draftArticles, publishedBooks, draftBooks, publishedVideos, recent] =
    await Promise.all([
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
      Book.countDocuments({ status: 'published' }),
      Book.countDocuments({ status: 'draft' }),
      Video.countDocuments({ status: 'published' }),
      Article.find({}).sort({ updatedAt: -1 }).limit(5).select('title slug status').lean(),
    ]);

  return (
    <AdminShell userName={session.name || session.email}>
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

      <div className="a-cards">
        <div className="a-card">
          <div className="a-stat">{publishedArticles}</div>
          <div className="a-statLabel">articles publiés</div>
        </div>
        <div className="a-card">
          <div className="a-stat">{draftArticles}</div>
          <div className="a-statLabel">brouillons</div>
        </div>
        <div className="a-card">
          <div className="a-stat">{publishedBooks}</div>
          <div className="a-statLabel">livres publiés</div>
        </div>
        <div className="a-card">
          <div className="a-stat">{draftBooks}</div>
          <div className="a-statLabel">livres en brouillon</div>
        </div>
        <div className="a-card">
          <div className="a-stat">{publishedVideos}</div>
          <div className="a-statLabel">vidéos publiées</div>
        </div>
      </div>

      <h2>Dernières modifications</h2>
      {recent.length === 0 ? (
        <div className="a-card a-empty">
          Aucun article pour l’instant.{' '}
          <Link href="/admin/articles/new">Écrire le premier</Link>.
        </div>
      ) : (
        <div className="a-tableWrap">
          <table className="a-table">
            <tbody>
              {recent.map((a) => (
                <tr key={String(a._id)}>
                  <td>
                    <Link href={`/admin/articles/${a._id}`} className="a-rowTitle">
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
