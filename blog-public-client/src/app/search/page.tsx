import { searchPosts } from '@/lib/api';
import { Pagination } from '@/components/Pagination';
import { CategoryBadge } from '@/components/CategoryBadge';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: { searchParams: { q?: string; page?: string } }) {
  const query = searchParams.q || '';
  const page = Number(searchParams.page) || 1;

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">記事を検索</h1>
        <p className="text-gray-500">検索キーワードを入力してください</p>
      </div>
    );
  }

  const data = await searchPosts(query, page);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        「{data.query}」の検索結果
      </h1>
      <p className="text-gray-500 mb-8">{data.pagination.totalItems}件の記事が見つかりました</p>

      <div className="space-y-6">
        {data.posts.map((post: any) => (
          <article key={post.postId} className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge code={post.category} name={post.categoryName} />
              <span className="text-xs text-gray-400">
                {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
              </span>
            </div>
            <Link href={`/posts/${post.slug}`}>
              <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-2">
                {post.highlight?.title ? (
                  <span dangerouslySetInnerHTML={{ __html: post.highlight.title[0] }} />
                ) : post.title}
              </h2>
            </Link>
            {post.highlight?.content && (
              <div className="text-sm text-gray-600 space-y-1">
                {post.highlight.content.map((fragment: string, i: number) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: `...${fragment}...` }} />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {data.posts.length === 0 && (
        <p className="text-center text-gray-500 py-16">
          「{query}」に一致する記事が見つかりませんでした
        </p>
      )}

      <Pagination pagination={data.pagination} basePath="/search" />
    </div>
  );
}
