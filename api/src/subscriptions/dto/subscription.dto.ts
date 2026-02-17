import { IsString, IsDateString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  userId: string;

  @IsString()
  planId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
