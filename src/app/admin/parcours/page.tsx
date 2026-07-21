import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Roadmap } from '@/models/Roadmap';
import AdminShell from '@/components/admin/AdminShell';
import RoadmapEditor from '@/components/admin/RoadmapEditor';

export const dynamic = 'force-dynamic';

export default async function AdminRoadmapPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  await dbConnect();
  const doc = await Roadmap.findOne({ key: 'main' }).lean();

  return (
    <AdminShell userName={session.name || session.email}>
      <RoadmapEditor
        initial={{
          imageUrl: doc?.imageUrl ?? '',
          imageAlt: doc?.imageAlt ?? '',
          fileUrl: doc?.fileUrl ?? '',
          note: doc?.note ?? '',
          published: Boolean(doc?.published),
        }}
      />
    </AdminShell>
  );
}
