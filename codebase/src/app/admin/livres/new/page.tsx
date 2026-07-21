'use client';

import AdminShell from '@/components/admin/AdminShell';
import BookEditor from '@/components/admin/BookEditor';

export default function NewBookPage() {
  return (
    <AdminShell>
      <BookEditor />
    </AdminShell>
  );
}
