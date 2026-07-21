import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Book } from '@/models/Book';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminBooksPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  await dbConnect();
  const books = await Book.find({}).sort({ order: 1, createdAt: -1 }).lean();

  return (
    <AdminShell userName={session.name || session.email}>
      <div className="a-head">
        <div>
          <h1>Livres recommandés</h1>
          <p className="a-sub">{books.length} livre(s) au total.</p>
        </div>
        <Link href="/admin/livres/new" className="a-btn a-btn-primary">
          Nouveau livre
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="a-card a-empty">
          Aucun livre pour l’instant.{' '}
          <Link href="/admin/livres/new">Ajouter le premier</Link>.
        </div>
      ) : (
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
                <tr key={String(b._id)}>
                  <td>
                    <Link href={`/admin/livres/${b._id}`} className="a-rowTitle">
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
                    <Link href={`/admin/livres/${b._id}`} className="a-btn">
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
