import { fetchCategoryPosts } from '@/lib/api';
import { PostCard } from '@/components/PostCard';
import { Pagination } from '@/components/Pagination';
import { notFound } from 'next/navigation';

export default async function CategoryPage({
  params, searchParams,
}: { params: { code: string }; searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;

  let data;
  try {
    data = await fetchCategoryPosts(params.code, page);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.category.name}</h1>
      <p className="text-gray-500 mb-8">{data.pagination.totalItems}件の記事</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.posts.map((post: any) => (
          <PostCard key={post.postId} post={post} />
        ))}
      </div>

      {data.posts.length === 0 && (
        <p className="text-center text-gray-500 py-16">このカテゴリの記事はまだありません</p>
      )}

      <Pagination pagination={data.pagination} basePath={`/categories/${params.code}`} />
    </div>
  );
}
