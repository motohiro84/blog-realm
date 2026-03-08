import { Controller, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { InternalService } from './internal.service';

@Controller('internal')
export class InternalController {
  constructor(private readonly internalService: InternalService) {}

  @Post('search/sync')
  sync(@Body() body: { postId: number }) {
    return this.internalService.syncPost(body.postId);
  }

  @Delete('search/:postId')
  remove(@Param('postId', ParseIntPipe) postId: number) {
    return this.internalService.deletePost(postId);
  }

  @Post('search/reindex')
  reindex() {
    return this.internalService.reindexAll();
  }
}
