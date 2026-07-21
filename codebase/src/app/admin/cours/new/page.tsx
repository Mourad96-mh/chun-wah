import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import ProgramEditor from '@/components/admin/ProgramEditor';

export const dynamic = 'force-dynamic';

export default async function NewProgramPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <AdminShell userName={session.name || session.email}>
      <ProgramEditor />
    </AdminShell>
  );
}
