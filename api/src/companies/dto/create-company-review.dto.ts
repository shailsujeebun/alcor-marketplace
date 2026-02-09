import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateCompanyReviewDto {
  @IsString()
  authorName!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;
}
