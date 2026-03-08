import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQuery } from './dto/search-query.dto';

@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() query: SearchQuery) {
    return this.searchService.searchPosts(query.q, query.page, query.limit, query.category);
  }
}
