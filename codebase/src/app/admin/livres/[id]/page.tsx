import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Book } from '@/models/Book';
import AdminShell from '@/components/admin/AdminShell';
import BookEditor from '@/components/admin/BookEditor';

export const dynamic = 'force-dynamic';

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  await dbConnect();
  const book = await Book.findById(id).lean();
  if (!book) notFound();

  return (
    <AdminShell userName={session.name || session.email}>
      <BookEditor
        initial={{
          _id: String(book._id),
          title: book.title ?? '',
          author: book.author ?? '',
          recommendation: book.recommendation ?? '',
          coverImage: book.coverImage ?? '',
          level: book.level ?? '',
          category: book.category ?? '',
          order: book.order ?? 100,
          status: book.status === 'published' ? 'published' : 'draft',
        }}
      />
    </AdminShell>
  );
}
