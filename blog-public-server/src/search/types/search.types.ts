import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { PaginationInfo } from '../../common/graphql/pagination.type';

@ObjectType()
export class SearchHighlight {
  @Field(() => [String], { nullable: true })
  title: string[] | null;

  @Field(() => [String], { nullable: true })
  content: string[] | null;
}

@ObjectType()
export class SearchAuthor {
  @Field(() => Int)
  authorId: number;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;
}

@ObjectType()
export class SearchPost {
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

  @Field(() => SearchAuthor)
  author: SearchAuthor;

  @Field(() => GraphQLISODateTime, { nullable: true })
  publishedAt: Date | null;

  @Field(() => SearchHighlight, { nullable: true })
  highlight: SearchHighlight | null;

  @Field(() => Float, { nullable: true })
  score: number | null;
}

@ObjectType()
export class SearchResult {
  @Field()
  query: string;

  @Field(() => [SearchPost])
  posts: SearchPost[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
