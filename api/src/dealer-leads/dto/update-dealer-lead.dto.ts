import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DealerLeadStatus } from '@prisma/client';

export class UpdateDealerLeadDto {
  @IsOptional()
  @IsEnum(DealerLeadStatus)
  status?: DealerLeadStatus;

  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
