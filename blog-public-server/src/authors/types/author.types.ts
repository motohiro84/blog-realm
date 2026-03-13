import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { PaginationInfo } from '../../common/graphql/pagination.type';

@ObjectType()
export class AuthorCategoryCount {
  @Field()
  code: string;

  @Field()
  name: string;

  @Field(() => Int)
  postCount: number;
}

@ObjectType()
export class AuthorLatestPost {
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

  @Field(() => String, { nullable: true })
  thumbnailUrl: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  publishedAt: Date | null;
}

@ObjectType()
export class AuthorProfile {
  @Field(() => Int)
  authorId: number;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field(() => Int)
  postCount: number;

  @Field(() => [AuthorCategoryCount])
  categories: AuthorCategoryCount[];

  @Field(() => [AuthorLatestPost])
  latestPosts: AuthorLatestPost[];
}

@ObjectType()
export class AuthorBrief {
  @Field(() => Int)
  authorId: number;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;
}

@ObjectType()
export class AuthorPostSummary {
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

  @Field(() => GraphQLISODateTime, { nullable: true })
  publishedAt: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastUpdatedAt: Date | null;
}

@ObjectType()
export class AuthorPostsResult {
  @Field(() => AuthorBrief)
  author: AuthorBrief;

  @Field(() => [AuthorPostSummary])
  posts: AuthorPostSummary[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
