import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { SearchResolver } from './search.resolver';

@Module({
  imports: [ElasticsearchModule.register({
    node: 'http://elasticsearch:9200',
  })],
  providers: [SearchService, SearchResolver],
  exports: [SearchService],
})
export class SearchModule {}
