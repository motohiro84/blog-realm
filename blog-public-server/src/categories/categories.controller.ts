import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PaginationQuery } from '../common/dto/pagination.dto';

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':code/posts')
  findPostsByCategory(@Param('code') code: string, @Query() query: PaginationQuery) {
    return this.categoriesService.findPostsByCategory(code, query.page, query.limit);
  }
}
