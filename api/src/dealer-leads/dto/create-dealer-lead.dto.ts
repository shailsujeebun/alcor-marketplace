import {
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  IsInt,
  IsArray,
  Min,
} from 'class-validator';

export class CreateDealerLeadDto {
  @IsString()
  companyName!: string;

  @IsString()
  contactPerson!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsOptional()
  @IsUUID()
  cityId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activityTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brands?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  equipmentCount?: number;

  @IsOptional()
  @IsString()
  message?: string;
}
