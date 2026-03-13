import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorProfile, AuthorPostsResult } from './types/author.types';

@Resolver()
export class AuthorsResolver {
  constructor(private readonly authorsService: AuthorsService) {}

  @Query(() => AuthorProfile, { nullable: true })
  async author(@Args('authorId', { type: () => Int }) authorId: number) {
    try {
      return await this.authorsService.findProfile(authorId);
    } catch (e) {
      if (e instanceof NotFoundException) return null;
      throw e;
    }
  }

  @Query(() => AuthorPostsResult, { nullable: true })
  async authorPosts(
    @Args('authorId', { type: () => Int }) authorId: number,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('category', { nullable: true }) category?: string,
  ) {
    try {
      return await this.authorsService.findPostsByAuthor(authorId, page ?? 1, limit ?? 10, category);
    } catch (e) {
      if (e instanceof NotFoundException) return null;
      throw e;
    }
  }
}
