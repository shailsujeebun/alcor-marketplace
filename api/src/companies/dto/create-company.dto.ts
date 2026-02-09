import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateCompanyPhoneDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsString()
  phoneE164!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateCompanyDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric with hyphens',
  })
  slug!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsOptional()
  @IsUUID()
  cityId?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsInt()
  utcOffsetMin?: number;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isOfficialDealer?: boolean;

  @IsOptional()
  @IsBoolean()
  isManufacturer?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyPhoneDto)
  phones?: CreateCompanyPhoneDto[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  activityTypeIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  brandIds?: string[];
}
