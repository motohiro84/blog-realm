import prisma from '../prisma';
import { Client } from '@elastic/elasticsearch';

const ALIAS = 'blog-posts';

function newIndexName(): string {
  return `${ALIAS}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}

const INDEX_SETTINGS = {
  analysis: {
    analyzer: {
      ja_analyzer: {
        type: 'custom' as const,
        tokenizer: 'kuromoji_tokenizer',
        filter: ['kuromoji_baseform', 'kuromoji_part_of_speech', 'cjk_width', 'ja_stop', 'kuromoji_stemmer', 'lowercase'],
      },
    },
  },
};

const INDEX_MAPPINGS = {
  properties: {
    postId:        { type: 'integer' as const },
    title:         { type: 'text' as const, analyzer: 'ja_analyzer', fields: { keyword: { type: 'keyword' as const } } },
    content:       { type: 'text' as const, analyzer: 'ja_analyzer' },
    category:      { type: 'keyword' as const },
    authorId:      { type: 'integer' as const },
    authorName:    { type: 'keyword' as const },
    thumbnailUrl:  { type: 'keyword' as const, index: false },
    slug:          { type: 'keyword' as const },
    isPublic:      { type: 'boolean' as const },
    publishedAt:   { type: 'date' as const },
    lastUpdatedAt: { type: 'date' as const },
  },
};

async function reindex(): Promise<void> {
  const es = new Client({ node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200' });

  console.log('[es-reindex] Fetching posts from PostgreSQL...');
  const posts = await prisma.blogPostPublished.findMany({
    where: { isPublic: true, isDeleted: false },
    include: {
      author: true,
      images: { where: { isThumbnail: true, isDeleted: false } },
    },
  });
  console.log(`[es-reindex] Found ${posts.length} posts`);

  // 新インデックスを作成してデータを投入
  const newIndex = newIndexName();
  await es.indices.create({ index: newIndex, settings: INDEX_SETTINGS, mappings: INDEX_MAPPINGS });
  console.log(`[es-reindex] Created new index: ${newIndex}`);

  if (posts.length > 0) {
    type Post = (typeof posts)[number];
    const body = posts.flatMap((post: Post) => [
      { index: { _index: newIndex, _id: String(post.postId) } },
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
    console.log(`[es-reindex] Indexed ${posts.length} posts into ${newIndex}`);
  }

  // エイリアスが存在しない場合、旧来の実インデックスが残っていれば削除して移行
  const aliasExists = await es.indices.existsAlias({ name: ALIAS });
  let oldIndices: string[] = [];

  if (aliasExists) {
    const aliasInfo = await es.indices.getAlias({ name: ALIAS });
    oldIndices = Object.keys(aliasInfo);
  } else {
    const indexExists = await es.indices.exists({ index: ALIAS });
    if (indexExists) {
      await es.indices.delete({ index: ALIAS });
      console.log(`[es-reindex] Deleted legacy real index "${ALIAS}" to migrate to alias`);
    }
  }

  // エイリアスを原子的に切り替え（検索ダウンタイムなし）
  await es.indices.updateAliases({
    actions: [
      ...oldIndices.map(oldIndex => ({ remove: { index: oldIndex, alias: ALIAS } })),
      { add: { index: newIndex, alias: ALIAS } },
    ],
  });
  console.log(`[es-reindex] Alias "${ALIAS}" now points to ${newIndex}`);

  // 旧インデックスを削除
  for (const oldIndex of oldIndices) {
    await es.indices.delete({ index: oldIndex });
    console.log(`[es-reindex] Deleted old index: ${oldIndex}`);
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
