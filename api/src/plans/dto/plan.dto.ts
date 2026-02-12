import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { PlanInterval } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  priceAmount: number;

  @IsOptional()
  @IsString()
  priceCurrency?: string;

  @IsEnum(PlanInterval)
  interval: PlanInterval;

  @IsNotEmpty()
  features: any;

  @IsNotEmpty()
  limits: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
