import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostListQuery } from './dto/post-query.dto';

@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query() query: PostListQuery) {
    return this.postsService.findAll(query);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }
}
