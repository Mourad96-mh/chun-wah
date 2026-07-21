import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Program } from '@/models/Program';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminProgramsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  await dbConnect();
  const programs = await Program.find({}).sort({ order: 1, createdAt: 1 }).lean();

  return (
    <AdminShell userName={session.name || session.email}>
      <div className="a-head">
        <div>
          <h1>Cours</h1>
          <p className="a-sub">{programs.length} cours au total.</p>
        </div>
        <Link href="/admin/cours/new" className="a-btn a-btn-primary">
          Nouveau cours
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="a-card a-empty">
          Aucun cours pour l’instant.{' '}
          <Link href="/admin/cours/new">Ajouter le premier</Link>.
        </div>
      ) : (
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
                <tr key={String(p._id)}>
                  <td>
                    <Link href={`/admin/cours/${p._id}`} className="a-rowTitle">
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
                    <Link href={`/admin/cours/${p._id}`} className="a-btn">
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
