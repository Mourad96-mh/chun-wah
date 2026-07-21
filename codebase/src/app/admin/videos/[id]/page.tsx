import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Video } from '@/models/Video';
import AdminShell from '@/components/admin/AdminShell';
import VideoEditor from '@/components/admin/VideoEditor';

export const dynamic = 'force-dynamic';

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  await dbConnect();
  const video = await Video.findById(id).lean();
  if (!video) notFound();

  return (
    <AdminShell userName={session.name || session.email}>
      <VideoEditor
        initial={{
          _id: String(video._id),
          title: video.title ?? '',
          description: video.description ?? '',
          videoUrl: video.videoUrl ?? '',
          poster: video.poster ?? '',
          order: video.order ?? 100,
          status: video.status === 'published' ? 'published' : 'draft',
        }}
      />
    </AdminShell>
  );
}
