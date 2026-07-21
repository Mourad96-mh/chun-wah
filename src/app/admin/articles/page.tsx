import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Article } from '@/models/Article';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export default async function AdminArticlesPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  await dbConnect();
  const articles = await Article.find({})
    .sort({ updatedAt: -1 })
    .select('title slug status publishedAt updatedAt')
    .lean();

  return (
    <AdminShell userName={session.name || session.email}>
      <div className="a-head">
        <div>
          <h1>Articles</h1>
          <p className="a-sub">{articles.length} article(s) au total.</p>
        </div>
        <Link href="/admin/articles/new" className="a-btn a-btn-primary">
          Nouvel article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="a-card a-empty">
          Aucun article pour l’instant.{' '}
          <Link href="/admin/articles/new">Écrire le premier</Link>.
        </div>
      ) : (
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
                <tr key={String(a._id)}>
                  <td>
                    <Link href={`/admin/articles/${a._id}`} className="a-rowTitle">
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
                      <Link href={`/admin/articles/${a._id}`} className="a-btn">
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
      )}
    </AdminShell>
  );
}
