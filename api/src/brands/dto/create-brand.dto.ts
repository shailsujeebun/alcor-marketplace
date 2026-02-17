import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  categoryId?: string;
}
