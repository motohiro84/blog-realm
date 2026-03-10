import { PrismaClient } from '@prisma/client';
import { Client } from '@elastic/elasticsearch';

const INDEX = 'blog-posts';

async function reindex(): Promise<void> {
  const prisma = new PrismaClient();
  const es = new Client({ node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200' });

  try {
    console.log('[es-reindex] Fetching posts from PostgreSQL...');
    const posts = await prisma.blogPostPublished.findMany({
      where: { isPublic: true, isDeleted: false },
      include: {
        author: true,
        images: { where: { isThumbnail: true, isDeleted: false } },
      },
    });
    console.log(`[es-reindex] Found ${posts.length} posts`);

    try {
      await es.indices.delete({ index: INDEX });
      console.log('[es-reindex] Deleted existing index');
    } catch {
      // インデックスが存在しない場合は無視
    }

    await es.indices.create({
      index: INDEX,
      settings: {
        analysis: {
          analyzer: {
            ja_analyzer: {
              type: 'custom',
              tokenizer: 'kuromoji_tokenizer',
              filter: ['kuromoji_baseform', 'kuromoji_part_of_speech', 'cjk_width', 'ja_stop', 'kuromoji_stemmer', 'lowercase'],
            },
          },
        },
      },
      mappings: {
        properties: {
          postId:        { type: 'integer' },
          title:         { type: 'text', analyzer: 'ja_analyzer', fields: { keyword: { type: 'keyword' } } },
          content:       { type: 'text', analyzer: 'ja_analyzer' },
          category:      { type: 'keyword' },
          authorId:      { type: 'integer' },
          authorName:    { type: 'keyword' },
          thumbnailUrl:  { type: 'keyword', index: false },
          slug:          { type: 'keyword' },
          isPublic:      { type: 'boolean' },
          publishedAt:   { type: 'date' },
          lastUpdatedAt: { type: 'date' },
        },
      },
    });
    console.log('[es-reindex] Created index with ja_analyzer');

    if (posts.length > 0) {
      type Post = (typeof posts)[number];
      const body = posts.flatMap((post: Post) => [
        { index: { _index: INDEX, _id: String(post.postId) } },
        {
          postId:        post.postId,
          title:         post.title,
          content:       post.content.replace(/<[^>]*>/g, ''),
          category:      post.category,
          authorId:      post.authorId,
          authorName:    post.author.displayName ?? `${post.author.firstName} ${post.author.lastName}`,
          thumbnailUrl:  post.images[0]?.imageUrl ?? null,
          slug:          post.slug,
          isPublic:      post.isPublic,
          publishedAt:   post.publishedAt,
          lastUpdatedAt: post.lastUpdatedAt,
        },
      ]);
      await es.bulk({ body });
      console.log(`[es-reindex] Indexed ${posts.length} posts`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

export function startCron(): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cron = require('node-cron');
  cron.schedule('0 0,12 * * *', async () => {
    console.log(`[es-reindex] Scheduled run started at ${new Date().toISOString()}`);
    try {
      await reindex();
      console.log('[es-reindex] Completed');
    } catch (err) {
      console.error('[es-reindex] Failed:', err);
    }
  });
  console.log('[es-reindex] Scheduled: 00:00 and 12:00');
}

// Lambda ハンドラー（本番用）
export const handler = async (): Promise<void> => {
  console.log('[lambda] es-reindex started');
  await reindex();
  console.log('[lambda] es-reindex completed');
};

// 単体実行用
if (require.main === module) {
  startCron();
}
