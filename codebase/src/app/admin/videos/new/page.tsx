import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import VideoEditor from '@/components/admin/VideoEditor';

export const dynamic = 'force-dynamic';

export default async function NewVideoPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <AdminShell userName={session.name || session.email}>
      <VideoEditor />
    </AdminShell>
  );
}
