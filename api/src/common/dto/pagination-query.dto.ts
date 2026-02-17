import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  get skip(): number {
    return (this.page! - 1) * this.limit!;
  }
}
