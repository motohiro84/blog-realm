import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class PostListQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  @IsIn(['TECH', 'DIARY', 'REVIEW'])
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(['publishedAt', 'lastUpdatedAt'])
  sortBy?: string = 'publishedAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string = 'desc';
}
