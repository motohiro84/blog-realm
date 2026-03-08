import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorPostsQuery } from './dto/author-query.dto';

@Controller('api/v1/authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get(':authorId')
  findProfile(@Param('authorId', ParseIntPipe) authorId: number) {
    return this.authorsService.findProfile(authorId);
  }

  @Get(':authorId/posts')
  findPosts(@Param('authorId', ParseIntPipe) authorId: number, @Query() query: AuthorPostsQuery) {
    return this.authorsService.findPostsByAuthor(authorId, query.page ?? 1, query.limit ?? 10, query.category);
  }
}
