import { fetchAuthor, fetchAuthorPosts } from '@/lib/api';
import { PostCard } from '@/components/PostCard';
import { Pagination } from '@/components/Pagination';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AuthorPage({
  params, searchParams,
}: { params: { id: string }; searchParams: { page?: string; category?: string } }) {
  const authorId = Number(params.id);
  const page = Number(searchParams.page) || 1;

  let author, postsData;
  try {
    [author, postsData] = await Promise.all([
      fetchAuthor(authorId),
      fetchAuthorPosts(authorId, page, searchParams.category),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg p-8 mb-8 flex flex-col md:flex-row gap-6 items-start">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} className="w-24 h-24 rounded-full" alt="" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-500 text-white text-3xl flex items-center justify-center font-bold">
            {author.displayName?.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{author.displayName}</h1>
          {author.bio && <p className="text-gray-600 mb-4">{author.bio}</p>}
          <div className="flex gap-4 text-sm text-gray-500">
            <span>{author.postCount}件の記事</span>
            {author.categories.map((cat: any) => (
              <Link key={cat.code} href={`/authors/${authorId}?category=${cat.code}`}
                    className="hover:text-blue-600">
                {cat.name} ({cat.postCount})
              </Link>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {searchParams.category ? `${searchParams.category}の記事` : '投稿記事'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postsData.posts.map((post: any) => (
          <PostCard key={post.postId} post={post} />
        ))}
      </div>

      <Pagination pagination={postsData.pagination} basePath={`/authors/${authorId}`} />
    </div>
  );
}
