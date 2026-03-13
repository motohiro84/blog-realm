import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { PaginationInfo } from '../../common/graphql/pagination.type';

@ObjectType()
export class CategoryInfo {
  @Field()
  code: string;

  @Field()
  name: string;

  @Field(() => Int)
  displayOrder: number;

  @Field(() => Int)
  postCount: number;
}

@ObjectType()
export class CategoriesResult {
  @Field(() => [CategoryInfo])
  categories: CategoryInfo[];
}

@ObjectType()
export class CategoryBrief {
  @Field()
  code: string;

  @Field()
  name: string;
}

@ObjectType()
export class CategoryPostAuthor {
  @Field(() => Int)
  authorId: number;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;
}

@ObjectType()
export class CategoryPostSummary {
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

  @Field(() => CategoryPostAuthor)
  author: CategoryPostAuthor;

  @Field(() => GraphQLISODateTime, { nullable: true })
  publishedAt: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastUpdatedAt: Date | null;
}

@ObjectType()
export class CategoryPostsResult {
  @Field(() => CategoryBrief)
  category: CategoryBrief;

  @Field(() => [CategoryPostSummary])
  posts: CategoryPostSummary[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
