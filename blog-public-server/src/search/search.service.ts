import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly esService: ElasticsearchService) {}

  async searchPosts(keyword: string, page: number = 1, limit: number = 20, category?: string) {
    const from = (page - 1) * limit;

    const filters: any[] = [{ term: { isPublic: true } }];
    if (category) filters.push({ term: { category } });

    try {
      const result = await this.esService.search({
        index: 'blog-posts',
        from, size: limit,
        query: {
          bool: {
            must: [{
              multi_match: {
                query: keyword,
                fields: ['title^3', 'content'],
                type: 'best_fields',
                fuzziness: 'AUTO',
              },
            }],
            filter: filters,
          },
        },
        highlight: {
          fields: {
            title: { number_of_fragments: 0 },
            content: { fragment_size: 200, number_of_fragments: 3 },
          },
          pre_tags: ['<mark>'], post_tags: ['</mark>'],
        },
        _source: ['postId', 'title', 'slug', 'category', 'authorId',
          'authorName', 'thumbnailUrl', 'publishedAt'],
      });

      const hits = result.hits.hits;
      const total = typeof result.hits.total === 'number'
        ? result.hits.total : (result.hits.total as any).value;

      const categoryNames: Record<string, string> = { TECH: '技術', DIARY: '日記', REVIEW: 'レビュー' };

      return {
        query: keyword,
        posts: hits.map((hit: any) => ({
          ...hit._source,
          categoryName: categoryNames[hit._source.category] || hit._source.category,
          author: {
            authorId: hit._source.authorId,
            displayName: hit._source.authorName,
            avatarUrl: null,
          },
          highlight: hit.highlight,
          score: hit._score,
        })),
        pagination: { currentPage: page, totalItems: total, itemsPerPage: limit },
      };
    } catch (error) {
      throw new InternalServerErrorException({
        code: 'SEARCH_ENGINE_ERROR', message: '検索エンジンでエラーが発生しました',
      });
    }
  }

  async indexPost(post: any) {
    await this.esService.index({
      index: 'blog-posts',
      id: String(post.postId),
      body: {
        postId: post.postId, title: post.title,
        content: post.content.replace(/<[^>]*>/g, ''),
        category: post.category, authorId: post.authorId,
        authorName: post.authorName, thumbnailUrl: post.thumbnailUrl,
        slug: post.slug, isPublic: post.isPublic,
        publishedAt: post.publishedAt, lastUpdatedAt: post.lastUpdatedAt,
      },
    });
  }

  async removePost(postId: number) {
    try {
      await this.esService.delete({ index: 'blog-posts', id: String(postId) });
    } catch (e) {
      // 404は無視（冪等性）
    }
  }

  async reindexAll(posts: any[]) {
    // 既存インデックス削除
    try { await this.esService.indices.delete({ index: 'blog-posts' }); } catch (e) {}

    // インデックス再作成
    await this.esService.indices.create({
      index: 'blog-posts',
      settings: {
        analysis: {
          analyzer: {
            ja_analyzer: {
              type: 'custom', tokenizer: 'kuromoji_tokenizer',
              filter: ['kuromoji_baseform', 'kuromoji_part_of_speech', 'cjk_width', 'ja_stop', 'kuromoji_stemmer', 'lowercase'],
            },
          },
        },
      },
      mappings: {
        properties: {
          postId: { type: 'integer' },
          title: { type: 'text', analyzer: 'ja_analyzer', fields: { keyword: { type: 'keyword' } } },
          content: { type: 'text', analyzer: 'ja_analyzer' },
          category: { type: 'keyword' }, authorId: { type: 'integer' },
          authorName: { type: 'keyword' }, thumbnailUrl: { type: 'keyword', index: false },
          slug: { type: 'keyword' }, isPublic: { type: 'boolean' },
          publishedAt: { type: 'date' }, lastUpdatedAt: { type: 'date' },
        },
      },
    });

    // バルクインデックス
    if (posts.length > 0) {
      const body = posts.flatMap((post) => [
        { index: { _index: 'blog-posts', _id: String(post.postId) } },
        {
          postId: post.postId, title: post.title,
          content: post.content.replace(/<[^>]*>/g, ''),
          category: post.category, authorId: post.authorId,
          authorName: post.authorName, thumbnailUrl: post.thumbnailUrl,
          slug: post.slug, isPublic: post.isPublic,
          publishedAt: post.publishedAt, lastUpdatedAt: post.lastUpdatedAt,
        },
      ]);
      await this.esService.bulk({ body });
    }

    return posts.length;
  }
}
