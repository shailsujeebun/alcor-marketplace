import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CompanyQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsOptional()
  @IsUUID()
  cityId?: string;

  @IsOptional()
  @IsUUID()
  activityTypeId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsBoolean()
  isOfficialDealer?: boolean;

  @IsOptional()
  @IsBoolean()
  isManufacturer?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
