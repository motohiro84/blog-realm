const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

// 記事一覧
export async function fetchPosts(params?: {
  page?: number; limit?: number; category?: string; sortBy?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.limit) sp.set('limit', String(params.limit));
  if (params?.category) sp.set('category', params.category);
  if (params?.sortBy) sp.set('sortBy', params.sortBy);
  return fetchApi<any>(`/api/v1/posts?${sp}`, { next: { revalidate: 60 } });
}

// 記事詳細
export async function fetchPostBySlug(slug: string) {
  return fetchApi<any>(`/api/v1/posts/${slug}`, { next: { revalidate: 60 } });
}

// カテゴリ一覧
export async function fetchCategories() {
  return fetchApi<any>('/api/v1/categories', { next: { revalidate: 3600 } });
}

// カテゴリ別記事
export async function fetchCategoryPosts(code: string, page?: number) {
  const sp = new URLSearchParams();
  if (page) sp.set('page', String(page));
  return fetchApi<any>(`/api/v1/categories/${code}/posts?${sp}`, { next: { revalidate: 60 } });
}

// 著者プロフィール
export async function fetchAuthor(authorId: number) {
  return fetchApi<any>(`/api/v1/authors/${authorId}`, { next: { revalidate: 300 } });
}

// 著者別記事
export async function fetchAuthorPosts(authorId: number, page?: number, category?: string) {
  const sp = new URLSearchParams();
  if (page) sp.set('page', String(page));
  if (category) sp.set('category', category);
  return fetchApi<any>(`/api/v1/authors/${authorId}/posts?${sp}`, { next: { revalidate: 60 } });
}

// 検索
export async function searchPosts(q: string, page?: number, category?: string) {
  const sp = new URLSearchParams({ q });
  if (page) sp.set('page', String(page));
  if (category) sp.set('category', category);
  return fetchApi<any>(`/api/v1/search?${sp}`, { cache: 'no-store' });
}
