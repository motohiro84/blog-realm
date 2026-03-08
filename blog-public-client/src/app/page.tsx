export const dynamic = 'force-dynamic';

import { fetchPosts, fetchCategories } from '@/lib/api';
import { PostCard } from '@/components/PostCard';
import { Pagination } from '@/components/Pagination';
import { Suspense } from 'react';
import Link from 'next/link';

export default async function HomePage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;

  const [postsData, categoriesData] = await Promise.all([
    fetchPosts({ page, limit: 12 }),
    fetchCategories(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">最新の記事</h1>
        <p className="text-gray-500 mb-8">技術・日記・レビューなど、さまざまな記事を公開しています</p>

        <div className="flex gap-3 mb-8">
          {categoriesData.categories.map((cat: any) => (
            <Link
              key={cat.code}
              href={`/categories/${cat.code}`}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition"
            >
              {cat.name} ({cat.postCount})
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postsData.posts.map((post: any) => (
          <PostCard key={post.postId} post={post} />
        ))}
      </div>

      {postsData.posts.length === 0 && (
        <p className="text-center text-gray-500 py-16">記事がまだありません</p>
      )}

      <Suspense fallback={<div>Loading pagination...</div>}>
        <Pagination pagination={postsData.pagination} basePath="/" />
      </Suspense>
    </div>
  );
}
