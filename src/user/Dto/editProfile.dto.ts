import { IsString, IsOptional } from 'class-validator';

export class EditProfileDto {
  @IsString()
  fullName;

  @IsString()
  @IsOptional()
  currentCity?: string;

  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  aboutYou?: string;
}
