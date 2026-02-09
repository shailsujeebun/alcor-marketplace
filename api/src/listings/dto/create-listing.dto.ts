import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListingCondition, ListingType, PriceType } from '@prisma/client';

class CreateListingMediaDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

class CreateListingAttributeDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;
}

export class CreateListingDto {
  @IsUUID()
  companyId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsEnum(ListingCondition)
  condition?: ListingCondition;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsNumber()
  priceAmount?: number;

  @IsOptional()
  @IsString()
  priceCurrency?: string;

  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsOptional()
  @IsUUID()
  cityId?: string;

  @IsOptional()
  @IsString()
  sellerName?: string;

  @IsOptional()
  @IsEmail()
  sellerEmail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sellerPhones?: string[];

  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsOptional()
  @IsInt()
  hoursValue?: number;

  @IsOptional()
  @IsString()
  hoursUnit?: string;

  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @IsOptional()
  @IsString()
  euroClass?: string;

  @IsOptional()
  @IsBoolean()
  isVideo?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListingMediaDto)
  media?: CreateListingMediaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListingAttributeDto)
  attributes?: CreateListingAttributeDto[];
}
