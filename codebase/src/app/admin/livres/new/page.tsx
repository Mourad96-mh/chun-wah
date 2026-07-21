import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import BookEditor from '@/components/admin/BookEditor';

export const dynamic = 'force-dynamic';

export default async function NewBookPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <AdminShell userName={session.name || session.email}>
      <BookEditor />
    </AdminShell>
  );
}
