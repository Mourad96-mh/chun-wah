'use client';

import { getName } from '@/lib/adminApi';
import AdminShell from '@/components/admin/AdminShell';
import ArticleEditor from '@/components/admin/ArticleEditor';

export default function NewArticlePage() {
  return (
    <AdminShell>
      <ArticleEditor
        initial={{
          title: '',
          slug: '',
          excerpt: '',
          body: '',
          coverImage: '',
          coverAlt: '',
          tags: [],
          author: getName(),
          status: 'draft',
        }}
      />
    </AdminShell>
  );
}
