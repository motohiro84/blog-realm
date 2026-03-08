import { IsNotEmpty, IsOptional, IsString, MaxLength, IsIn } from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class SearchQuery extends PaginationQuery {
  @IsNotEmpty({ message: '検索キーワードは必須です' })
  @IsString()
  @MaxLength(200)
  q: string;

  @IsOptional()
  @IsString()
  @IsIn(['TECH', 'DIARY', 'REVIEW'])
  category?: string;
}
