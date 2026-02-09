import { IsString, IsOptional, IsUUID, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric with hyphens',
  })
  slug!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
