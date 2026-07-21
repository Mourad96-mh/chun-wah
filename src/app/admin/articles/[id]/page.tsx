import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Article } from '@/models/Article';
import AdminShell from '@/components/admin/AdminShell';
import ArticleEditor from '@/components/admin/ArticleEditor';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;

  // A malformed id would make findById throw a CastError.
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  await dbConnect();
  const article = await Article.findById(id).lean();
  if (!article) notFound();

  return (
    <AdminShell userName={session.name || session.email}>
      <ArticleEditor
        initial={{
          _id: String(article._id),
          title: article.title ?? '',
          slug: article.slug ?? '',
          excerpt: article.excerpt ?? '',
          body: article.body ?? '',
          coverImage: article.coverImage ?? '',
          coverAlt: article.coverAlt ?? '',
          tags: article.tags ?? [],
          author: article.author ?? '',
          status: article.status === 'published' ? 'published' : 'draft',
        }}
      />
    </AdminShell>
  );
}
