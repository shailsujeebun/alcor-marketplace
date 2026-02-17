import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CityQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  countryId?: string;
}
