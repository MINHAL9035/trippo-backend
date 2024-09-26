import { IsString, IsOptional } from 'class-validator';

export class EditProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  currentCity?: string;

  @IsOptional()
  // @IsUrl()
  website?: string;

  @IsString()
  @IsOptional()
  aboutYou?: string;
}
