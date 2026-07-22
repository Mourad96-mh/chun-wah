'use client';

import AdminShell from '@/components/admin/AdminShell';
import VideoEditor from '@/components/admin/VideoEditor';

export default function NewVideoPage() {
  return (
    <AdminShell>
      <VideoEditor />
    </AdminShell>
  );
}
