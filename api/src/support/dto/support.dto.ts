import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsString()
  priority?: string;
}

export class ReplyTicketDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}
