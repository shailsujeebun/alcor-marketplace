import { IsString, Length } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @Length(2, 2)
  iso2!: string;

  @IsString()
  name!: string;
}
