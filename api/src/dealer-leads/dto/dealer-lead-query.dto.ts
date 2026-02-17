import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { DealerLeadStatus } from '@prisma/client';

export class DealerLeadQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(DealerLeadStatus)
  status?: DealerLeadStatus;

  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;
}
