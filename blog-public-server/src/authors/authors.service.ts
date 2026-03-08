import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async findProfile(authorId: number) {
    const user = await this.prisma.user.findFirst({
      where: { userId: authorId, isPublic: true, isDeleted: false },
      select: { userId: true, displayName: true, profileImageUrl: true, bio: true },
    });

    if (!user) {
      throw new NotFoundException({ code: 'AUTHOR_NOT_FOUND', message: '著者が見つかりません' });
    }

    const postCount = await this.prisma.blogPostPublished.count({
      where: { authorId, isPublic: true, isDeleted: false },
    });

    const categoryCounts = await this.prisma.blogPostPublished.groupBy({
      by: ['category'],
      where: { authorId, isPublic: true, isDeleted: false },
      _count: { postId: true },
    });

    const categoryNames: Record<string, string> = { TECH: '技術', DIARY: '日記', REVIEW: 'レビュー' };

    const latestPosts = await this.prisma.blogPostPublished.findMany({
      where: { authorId, isPublic: true, isDeleted: false },
      select: {
        postId: true, title: true, slug: true, category: true,
        publishedAt: true,
        images: { where: { isThumbnail: true, isDeleted: false }, select: { imageUrl: true }, take: 1 },
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });

    return {
      authorId: user.userId,
      displayName: user.displayName,
      avatarUrl: user.profileImageUrl,
      bio: user.bio,
      postCount,
      categories: categoryCounts.map((cc) => ({
        code: cc.category,
        name: categoryNames[cc.category] || cc.category,
        postCount: cc._count.postId,
      })),
      latestPosts: latestPosts.map((p) => ({
        postId: p.postId, title: p.title, slug: p.slug,
        category: p.category, categoryName: categoryNames[p.category] || p.category,
        thumbnailUrl: p.images[0]?.imageUrl ?? null, publishedAt: p.publishedAt,
      })),
    };
  }

  async findPostsByAuthor(authorId: number, page: number, limit: number, category?: string) {
    const user = await this.prisma.user.findFirst({
      where: { userId: authorId, isPublic: true, isDeleted: false },
      select: { userId: true, displayName: true, profileImageUrl: true },
    });
    if (!user) {
      throw new NotFoundException({ code: 'AUTHOR_NOT_FOUND', message: '著者が見つかりません' });
    }

    const skip = (page - 1) * limit;
    const where: any = { authorId, isPublic: true, isDeleted: false };
    if (category) where.category = category;

    const categoryNames: Record<string, string> = { TECH: '技術', DIARY: '日記', REVIEW: 'レビュー' };

    const [posts, totalCount] = await Promise.all([
      this.prisma.blogPostPublished.findMany({
        where,
        select: {
          postId: true, title: true, slug: true, content: true,
          category: true, publishedAt: true, lastUpdatedAt: true,
          images: { where: { isThumbnail: true, isDeleted: false }, select: { imageUrl: true }, take: 1 },
        },
        orderBy: { publishedAt: 'desc' },
        skip, take: limit,
      }),
      this.prisma.blogPostPublished.count({ where }),
    ]);

    return {
      author: { authorId: user.userId, displayName: user.displayName, avatarUrl: user.profileImageUrl },
      posts: posts.map((post) => ({
        postId: post.postId, title: post.title, slug: post.slug,
        category: post.category, categoryName: categoryNames[post.category] || post.category,
        excerpt: post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        thumbnailUrl: post.images[0]?.imageUrl ?? null,
        publishedAt: post.publishedAt, lastUpdatedAt: post.lastUpdatedAt,
      })),
      pagination: { currentPage: page, totalItems: totalCount, itemsPerPage: limit },
    };
  }
}
