import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Settings } from '@/models/Settings';
import AdminShell from '@/components/admin/AdminShell';
import NavSettings from '@/components/admin/NavSettings';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  await dbConnect();
  const doc = await Settings.findOne({ key: 'main' })
    .select('hiddenNav')
    .lean<{ hiddenNav?: string[] }>();

  return (
    <AdminShell userName={session.name || session.email}>
      <NavSettings initialHidden={doc?.hiddenNav ?? []} />
    </AdminShell>
  );
}
