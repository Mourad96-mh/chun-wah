import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Media } from '@/models/Media';
import { MEDIA_SLOTS } from '@/lib/media';
import AdminShell from '@/components/admin/AdminShell';
import MediaManager from '@/components/admin/MediaManager';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  await dbConnect();
  const doc = await Media.findOne({ key: 'main' })
    .select('items')
    .lean<{ items?: { slot: string; url: string; alt: string; name: string }[] }>();

  const initial: Record<string, { url: string; alt: string; name: string }> = {};
  for (const item of doc?.items ?? []) {
    initial[item.slot] = { url: item.url ?? '', alt: item.alt ?? '', name: item.name ?? '' };
  }

  return (
    <AdminShell userName={session.name || session.email}>
      <MediaManager slots={MEDIA_SLOTS} initial={initial} />
    </AdminShell>
  );
}
