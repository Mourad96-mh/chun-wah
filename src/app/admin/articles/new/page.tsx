import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import ArticleEditor from '@/components/admin/ArticleEditor';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <AdminShell userName={session.name || session.email}>
      <ArticleEditor
        initial={{
          title: '',
          slug: '',
          excerpt: '',
          body: '',
          coverImage: '',
          coverAlt: '',
          tags: [],
          author: session.name || '',
          status: 'draft',
        }}
      />
    </AdminShell>
  );
}
