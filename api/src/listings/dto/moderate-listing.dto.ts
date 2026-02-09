import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ListingStatus } from '@prisma/client';

export class ModerateListingDto {
  @IsEnum(ListingStatus)
  status!: ListingStatus;

  @IsOptional()
  @IsString()
  moderationReason?: string;
}
