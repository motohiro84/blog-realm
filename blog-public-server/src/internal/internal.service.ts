import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';

@Injectable()
export class InternalService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {}

  async syncPost(postId: number) {
    const post = await this.prisma.blogPostPublished.findFirst({
      where: { postId, isPublic: true, isDeleted: false },
      include: {
        author: { select: { displayName: true } },
        images: {
          where: { isThumbnail: true, isDeleted: false },
          select: { imageUrl: true }, take: 1,
        },
      },
    });

    if (!post) throw new NotFoundException({ code: 'POST_NOT_FOUND', message: '公開記事が見つかりません' });

    await this.searchService.indexPost({
      postId: post.postId, title: post.title, content: post.content,
      category: post.category, authorId: post.authorId,
      authorName: post.author.displayName,
      thumbnailUrl: post.images[0]?.imageUrl ?? null,
      slug: post.slug, isPublic: post.isPublic,
      publishedAt: post.publishedAt, lastUpdatedAt: post.lastUpdatedAt,
    });

    return { status: 'synced', postId, indexedAt: new Date().toISOString() };
  }

  async deletePost(postId: number) {
    await this.searchService.removePost(postId);
    return { status: 'deleted', postId, deletedAt: new Date().toISOString() };
  }

  async reindexAll() {
    const start = Date.now();

    const posts = await this.prisma.blogPostPublished.findMany({
      where: { isPublic: true, isDeleted: false },
      include: {
        author: { select: { displayName: true } },
        images: {
          where: { isThumbnail: true, isDeleted: false },
          select: { imageUrl: true }, take: 1,
        },
      },
    });

    const indexData = posts.map((post) => ({
      postId: post.postId, title: post.title, content: post.content,
      category: post.category, authorId: post.authorId,
      authorName: post.author.displayName,
      thumbnailUrl: post.images[0]?.imageUrl ?? null,
      slug: post.slug, isPublic: post.isPublic,
      publishedAt: post.publishedAt, lastUpdatedAt: post.lastUpdatedAt,
    }));

    const count = await this.searchService.reindexAll(indexData);
    const duration = ((Date.now() - start) / 1000).toFixed(1);

    return {
      status: 'reindexed', indexedCount: count,
      duration: `${duration}s`, completedAt: new Date().toISOString(),
    };
  }
}
