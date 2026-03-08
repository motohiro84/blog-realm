import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const masters = await this.prisma.master.findMany({
      where: { category: 'blog_categories' },
      orderBy: { displayOrder: 'asc' },
    });

    const postCounts = await this.prisma.blogPostPublished.groupBy({
      by: ['category'],
      where: { isPublic: true, isDeleted: false },
      _count: { postId: true },
    });

    const countMap = new Map(postCounts.map((pc) => [pc.category, pc._count.postId]));

    return {
      categories: masters.map((m) => ({
        code: m.code,
        name: m.displayName,
        displayOrder: m.displayOrder,
        postCount: countMap.get(m.code) || 0,
      })),
    };
  }

  async findPostsByCategory(code: string, page: number = 1, limit: number = 20) {
    const master = await this.prisma.master.findFirst({
      where: { category: 'blog_categories', code },
    });
    if (!master) {
      throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', message: 'カテゴリが見つかりません' });
    }

    const skip = (page - 1) * limit;
    const where = { category: code, isPublic: true, isDeleted: false };

    const [posts, totalCount] = await Promise.all([
      this.prisma.blogPostPublished.findMany({
        where,
        select: {
          postId: true, title: true, slug: true, content: true,
          category: true, publishedAt: true, lastUpdatedAt: true,
          author: { select: { userId: true, displayName: true, profileImageUrl: true } },
          images: { where: { isThumbnail: true, isDeleted: false }, select: { imageUrl: true }, take: 1 },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.blogPostPublished.count({ where }),
    ]);

    return {
      category: { code: master.code, name: master.displayName },
      posts: posts.map((post) => ({
        postId: post.postId, title: post.title, slug: post.slug,
        category: post.category, categoryName: master.displayName,
        excerpt: post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        thumbnailUrl: post.images[0]?.imageUrl ?? null,
        author: {
          authorId: post.author.userId,
          displayName: post.author.displayName,
          avatarUrl: post.author.profileImageUrl,
        },
        publishedAt: post.publishedAt, lastUpdatedAt: post.lastUpdatedAt,
      })),
      pagination: { currentPage: page, totalItems: totalCount, itemsPerPage: limit },
    };
  }
}
