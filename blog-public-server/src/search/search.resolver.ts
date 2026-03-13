import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { SearchService } from './search.service';
import { SearchResult } from './types/search.types';

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => SearchResult)
  search(
    @Args('q') q: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('category', { nullable: true }) category?: string,
  ) {
    return this.searchService.searchPosts(q, page, limit, category);
  }
}
