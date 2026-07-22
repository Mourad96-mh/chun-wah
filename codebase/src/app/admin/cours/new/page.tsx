'use client';

import AdminShell from '@/components/admin/AdminShell';
import ProgramEditor from '@/components/admin/ProgramEditor';

export default function NewProgramPage() {
  return (
    <AdminShell>
      <ProgramEditor />
    </AdminShell>
  );
}
