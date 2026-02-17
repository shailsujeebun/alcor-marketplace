import { IsString } from 'class-validator';

export class CreateActivityTypeDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;
}
