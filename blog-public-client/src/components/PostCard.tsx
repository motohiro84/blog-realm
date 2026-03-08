import Link from 'next/link';
import { CategoryBadge } from './CategoryBadge';
import type { PostSummary } from '@/types';

export function PostCard({ post }: { post: PostSummary }) {
  const date = new Date(post.publishedAt).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      <Link href={`/posts/${post.slug}`}>
        {post.thumbnailUrl ? (
          <div className="aspect-video bg-gray-100">
            <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <span className="text-4xl text-blue-200">📝</span>
          </div>
        )}
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge code={post.category} name={post.categoryName} />
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2 mb-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
        <Link href={`/authors/${post.author.authorId}`} className="flex items-center gap-2">
          {post.author.avatarUrl ? (
            <img src={post.author.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
              {post.author.displayName?.charAt(0)}
            </div>
          )}
          <span className="text-xs text-gray-500">{post.author.displayName}</span>
        </Link>
      </div>
    </article>
  );
}
