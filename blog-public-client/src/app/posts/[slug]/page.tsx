import { fetchPostBySlug } from '@/lib/api';
import { CategoryBadge } from '@/components/CategoryBadge';
import { PostCard } from '@/components/PostCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PostPage({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = await fetchPostBySlug(params.slug);
  } catch {
    notFound();
  }

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CategoryBadge code={post.category} name={post.categoryName} />
          <time className="text-sm text-gray-400">{publishedDate}</time>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>
        <Link href={`/authors/${post.author.authorId}`} className="flex items-center gap-3">
          {post.author.avatarUrl ? (
            <img src={post.author.avatarUrl} className="w-10 h-10 rounded-full" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {post.author.displayName?.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{post.author.displayName}</div>
            {post.author.bio && <div className="text-xs text-gray-500 line-clamp-1">{post.author.bio}</div>}
          </div>
        </Link>
      </div>

      {post.thumbnailUrl && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img src={post.thumbnailUrl} alt={post.title} className="w-full" />
        </div>
      )}

      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.relatedPosts?.length > 0 && (
        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">関連記事</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {post.relatedPosts.map((rp: any) => (
              <Link key={rp.postId} href={`/posts/${rp.slug}`} className="group">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {rp.thumbnailUrl ? (
                    <img src={rp.thumbnailUrl} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📝</div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">{rp.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
