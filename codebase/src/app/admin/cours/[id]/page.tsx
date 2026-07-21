import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Program } from '@/models/Program';
import AdminShell from '@/components/admin/AdminShell';
import ProgramEditor from '@/components/admin/ProgramEditor';

export const dynamic = 'force-dynamic';

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  await dbConnect();
  const program = await Program.findById(id).lean<{
    _id: unknown;
    name?: string;
    slug?: string;
    order?: number;
    tagline?: string;
    intro?: string;
    benefits?: string[];
    ageRange?: string;
    level?: string;
    duration?: string;
    image?: string;
    imageAlt?: string;
    status?: string;
  }>();
  if (!program) notFound();

  return (
    <AdminShell userName={session.name || session.email}>
      <ProgramEditor
        initial={{
          _id: String(program._id),
          name: program.name ?? '',
          slug: program.slug ?? '',
          order: program.order ?? 100,
          tagline: program.tagline ?? '',
          intro: program.intro ?? '',
          benefits: (program.benefits ?? []).join('\n'),
          ageRange: program.ageRange ?? '',
          level: program.level ?? '',
          duration: program.duration ?? '',
          image: program.image ?? '',
          imageAlt: program.imageAlt ?? '',
          status: program.status === 'published' ? 'published' : 'draft',
        }}
      />
    </AdminShell>
  );
}
