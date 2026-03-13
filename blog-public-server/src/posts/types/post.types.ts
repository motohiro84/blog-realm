import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { PaginationInfo } from '../../common/graphql/pagination.type';

@ObjectType()
export class PostAuthor {
  @Field(() => Int)
  authorId: number;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;
}

@ObjectType()
export class PostAuthorDetail {
  @Field(() => Int)
  authorId: number;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => String, { nullable: true })
  bio: string | null;
}

@ObjectType()
export class PostSummary {
  @Field(() => Int)
  postId: number;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  category: string;

  @Field()
  categoryName: string;

  @Field()
  excerpt: string;

  @Field(() => String, { nullable: true })
  thumbnailUrl: string | null;

  @Field(() => PostAuthor)
  author: PostAuthor;

  @Field(() => GraphQLISODateTime, { nullable: true })
  publishedAt: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastUpdatedAt: Date | null;
}

@ObjectType()
export class PostListResult {
  @Field(() => [PostSummary])
  posts: PostSummary[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}

@ObjectType()
export class PostImage {
  @Field()
  imageUrl: string;

  @Field()
  isThumbnail: boolean;

  @Field(() => Int)
  displayOrder: number;
}

@ObjectType()
export class RelatedPost {
  @Field(() => Int)
  postId: number;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field(() => String, { nullable: true })
  thumbnailUrl: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  publishedAt: Date | null;
}

@ObjectType()
export class PostDetail {
  @Field(() => Int)
  postId: number;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  content: string;

  @Field()
  category: string;

  @Field()
  categoryName: string;

  @Field(() => String, { nullable: true })
  thumbnailUrl: string | null;

  @Field(() => PostAuthorDetail)
  author: PostAuthorDetail;

  @Field(() => [PostImage])
  images: PostImage[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  publishedAt: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastUpdatedAt: Date | null;

  @Field(() => [RelatedPost])
  relatedPosts: RelatedPost[];
}
