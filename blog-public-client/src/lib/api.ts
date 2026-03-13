const GRAPHQL_URL = `${process.env.API_URL || 'http://localhost:4001'}/graphql`;

async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    ...options,
  });
  if (!res.ok) throw new Error(`GraphQL Error: ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

// 記事一覧
export async function fetchPosts(params?: {
  page?: number; limit?: number; category?: string; sortBy?: string;
}) {
  const data = await gql<{ posts: any }>(
    `query Posts($page: Int, $limit: Int, $category: String, $sortBy: String) {
      posts(page: $page, limit: $limit, category: $category, sortBy: $sortBy) {
        posts {
          postId title slug category categoryName excerpt thumbnailUrl publishedAt lastUpdatedAt
          author { authorId displayName avatarUrl }
        }
        pagination { currentPage totalItems itemsPerPage }
      }
    }`,
    { page: params?.page, limit: params?.limit, category: params?.category, sortBy: params?.sortBy },
    { next: { revalidate: 60 } },
  );
  return data.posts;
}

// 記事詳細
export async function fetchPostBySlug(slug: string) {
  const data = await gql<{ post: any }>(
    `query Post($slug: String!) {
      post(slug: $slug) {
        postId title slug content category categoryName thumbnailUrl publishedAt lastUpdatedAt
        author { authorId displayName avatarUrl bio }
        images { imageUrl isThumbnail displayOrder }
        relatedPosts { postId title slug thumbnailUrl publishedAt }
      }
    }`,
    { slug },
    { next: { revalidate: 60 } },
  );
  return data.post;
}

// カテゴリ一覧
export async function fetchCategories() {
  const data = await gql<{ categories: any }>(
    `query {
      categories {
        categories { code name displayOrder postCount }
      }
    }`,
    undefined,
    { next: { revalidate: 3600 } },
  );
  return data.categories;
}

// カテゴリ別記事
export async function fetchCategoryPosts(code: string, page?: number) {
  const data = await gql<{ categoryPosts: any }>(
    `query CategoryPosts($code: String!, $page: Int) {
      categoryPosts(code: $code, page: $page) {
        category { code name }
        posts {
          postId title slug category categoryName excerpt thumbnailUrl publishedAt lastUpdatedAt
          author { authorId displayName avatarUrl }
        }
        pagination { currentPage totalItems itemsPerPage }
      }
    }`,
    { code, page },
    { next: { revalidate: 60 } },
  );
  return data.categoryPosts;
}

// 著者プロフィール
export async function fetchAuthor(authorId: number) {
  const data = await gql<{ author: any }>(
    `query Author($authorId: Int!) {
      author(authorId: $authorId) {
        authorId displayName avatarUrl bio postCount
        categories { code name postCount }
        latestPosts { postId title slug category categoryName thumbnailUrl publishedAt }
      }
    }`,
    { authorId },
    { next: { revalidate: 300 } },
  );
  return data.author;
}

// 著者別記事
export async function fetchAuthorPosts(authorId: number, page?: number, category?: string) {
  const data = await gql<{ authorPosts: any }>(
    `query AuthorPosts($authorId: Int!, $page: Int, $category: String) {
      authorPosts(authorId: $authorId, page: $page, category: $category) {
        author { authorId displayName avatarUrl }
        posts {
          postId title slug category categoryName excerpt thumbnailUrl publishedAt lastUpdatedAt
        }
        pagination { currentPage totalItems itemsPerPage }
      }
    }`,
    { authorId, page, category },
    { next: { revalidate: 60 } },
  );
  const result = data.authorPosts;
  return {
    ...result,
    posts: result.posts.map((post: any) => ({ ...post, author: result.author })),
  };
}

// 検索
export async function searchPosts(q: string, page?: number, category?: string) {
  const data = await gql<{ search: any }>(
    `query Search($q: String!, $page: Int, $category: String) {
      search(q: $q, page: $page, category: $category) {
        query
        posts {
          postId title slug category categoryName thumbnailUrl publishedAt score
          author { authorId displayName avatarUrl }
          highlight { title content }
        }
        pagination { currentPage totalItems itemsPerPage }
      }
    }`,
    { q, page, category },
    { cache: 'no-store' },
  );
  return data.search;
}
