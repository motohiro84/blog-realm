export interface PostSummary {
  postId: number;
  title: string;
  slug: string;
  category: string;
  categoryName: string;
  excerpt: string;
  thumbnailUrl: string | null;
  author: AuthorBrief;
  publishedAt: string;
  lastUpdatedAt: string;
}

export interface PostDetail extends PostSummary {
  content: string;
  images: { imageUrl: string; isThumbnail: boolean; displayOrder: number }[];
  relatedPosts: RelatedPost[];
}

export interface RelatedPost {
  postId: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  publishedAt: string;
}

export interface AuthorBrief {
  authorId: number;
  displayName: string;
  avatarUrl: string | null;
}

export interface AuthorProfile extends AuthorBrief {
  bio: string | null;
  postCount: number;
  categories: { code: string; name: string; postCount: number }[];
  latestPosts: PostSummary[];
}

export interface CategoryInfo {
  code: string;
  name: string;
  displayOrder: number;
  postCount: number;
}

export interface SearchResult {
  query: string;
  posts: (PostSummary & { highlight?: any; score?: number })[];
  pagination: Pagination;
}

export interface Pagination {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedPosts {
  posts: PostSummary[];
  pagination: Pagination;
}
