import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class UpdateListingContactDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phoneCountry!: string;

  @IsString()
  phoneNumber!: string;

  @IsOptional()
  @IsBoolean()
  privacyConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  termsConsent?: boolean;
}
