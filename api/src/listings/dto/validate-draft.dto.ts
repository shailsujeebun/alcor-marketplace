import { IsString, IsObject, IsOptional } from 'class-validator';

export class ValidateDraftDto {
    @IsString()
    categoryId!: string;

    @IsObject()
    @IsOptional()
    attributes?: Record<string, any>;
}
