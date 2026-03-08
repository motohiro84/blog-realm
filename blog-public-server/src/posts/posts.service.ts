import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostListQuery } from './dto/post-query.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PostListQuery) {
    const { page = 1, limit = 20, category, sortBy = 'publishedAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = { isPublic: true, isDeleted: false };
    if (category) where.category = category;

    const orderByField = sortBy === 'lastUpdatedAt' ? 'lastUpdatedAt' : 'publishedAt';

    const [posts, totalCount] = await Promise.all([
      this.prisma.blogPostPublished.findMany({
        where,
        select: {
          postId: true, title: true, slug: true, content: true,
          category: true, publishedAt: true, lastUpdatedAt: true,
          author: {
            select: { userId: true, displayName: true, profileImageUrl: true },
          },
          images: {
            where: { isThumbnail: true, isDeleted: false },
            select: { imageUrl: true },
            take: 1,
          },
        },
        orderBy: { [orderByField]: order as 'asc' | 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.blogPostPublished.count({ where }),
    ]);

    // カテゴリ名マッピング
    const categoryNames: Record<string, string> = { TECH: '技術', DIARY: '日記', REVIEW: 'レビュー' };

    return {
      posts: posts.map((post) => ({
        postId: post.postId,
        title: post.title,
        slug: post.slug,
        category: post.category,
        categoryName: categoryNames[post.category] || post.category,
        excerpt: this.createExcerpt(post.content, 200),
        thumbnailUrl: post.images[0]?.imageUrl ?? null,
        author: {
          authorId: post.author.userId,
          displayName: post.author.displayName,
          avatarUrl: post.author.profileImageUrl,
        },
        publishedAt: post.publishedAt,
        lastUpdatedAt: post.lastUpdatedAt,
      })),
      pagination: { currentPage: page, totalItems: totalCount, itemsPerPage: limit },
    };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPostPublished.findFirst({
      where: { slug, isPublic: true, isDeleted: false },
      include: {
        author: {
          select: { userId: true, displayName: true, profileImageUrl: true, bio: true },
        },
        images: {
          where: { isDeleted: false },
          orderBy: { displayOrder: 'asc' },
          select: { imageUrl: true, isThumbnail: true, displayOrder: true },
        },
      },
    });

    if (!post) throw new NotFoundException({ code: 'POST_NOT_FOUND', message: '記事が見つかりません' });

    const categoryNames: Record<string, string> = { TECH: '技術', DIARY: '日記', REVIEW: 'レビュー' };

    // 関連記事（同カテゴリ最新3件、自身除く）
    const relatedPosts = await this.prisma.blogPostPublished.findMany({
      where: {
        category: post.category, isPublic: true, isDeleted: false,
        postId: { not: post.postId },
      },
      select: { postId: true, title: true, slug: true, publishedAt: true,
        images: { where: { isThumbnail: true, isDeleted: false }, select: { imageUrl: true }, take: 1 },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });

    return {
      postId: post.postId,
      title: post.title,
      slug: post.slug,
      content: post.content,
      category: post.category,
      categoryName: categoryNames[post.category] || post.category,
      thumbnailUrl: post.images.find((i) => i.isThumbnail)?.imageUrl ?? null,
      author: {
        authorId: post.author.userId,
        displayName: post.author.displayName,
        avatarUrl: post.author.profileImageUrl,
        bio: post.author.bio,
      },
      images: post.images.filter((i) => !i.isThumbnail),
      publishedAt: post.publishedAt,
      lastUpdatedAt: post.lastUpdatedAt,
      relatedPosts: relatedPosts.map((rp) => ({
        postId: rp.postId, title: rp.title, slug: rp.slug,
        thumbnailUrl: rp.images[0]?.imageUrl ?? null, publishedAt: rp.publishedAt,
      })),
    };
  }

  private createExcerpt(html: string, maxLength: number): string {
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
