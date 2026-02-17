import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCompanyFlagsDto {
  @IsOptional()
  @IsBoolean()
  isOfficialDealer?: boolean;

  @IsOptional()
  @IsBoolean()
  isManufacturer?: boolean;
}
