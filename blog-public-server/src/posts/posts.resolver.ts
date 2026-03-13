import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostListResult, PostDetail } from './types/post.types';

@Resolver()
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => PostListResult)
  posts(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('category', { nullable: true }) category?: string,
    @Args('sortBy', { nullable: true }) sortBy?: string,
    @Args('order', { nullable: true }) order?: string,
  ) {
    return this.postsService.findAll({ page, limit, category, sortBy, order });
  }

  @Query(() => PostDetail, { nullable: true })
  async post(@Args('slug') slug: string) {
    try {
      return await this.postsService.findBySlug(slug);
    } catch (e) {
      if (e instanceof NotFoundException) return null;
      throw e;
    }
  }
}
