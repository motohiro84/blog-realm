import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesResult, CategoryPostsResult } from './types/category.types';

@Resolver()
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => CategoriesResult)
  categories() {
    return this.categoriesService.findAll();
  }

  @Query(() => CategoryPostsResult, { nullable: true })
  async categoryPosts(
    @Args('code') code: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    try {
      return await this.categoriesService.findPostsByCategory(code, page, limit);
    } catch (e) {
      if (e instanceof NotFoundException) return null;
      throw e;
    }
  }
}
