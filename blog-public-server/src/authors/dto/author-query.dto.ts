import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class AuthorPostsQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  @IsIn(['TECH', 'DIARY', 'REVIEW'])
  category?: string;
}
