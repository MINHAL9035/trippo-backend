import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  Matches,
} from 'class-validator';

export class EditUserProfileDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'firstName can only contain letters, numbers, and underscores',
  })
  @MaxLength(50, { message: 'firstName must be less than 50 characters' })
  firstName: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'lastName can only contain letters, numbers, and underscores',
  })
  @MaxLength(50, { message: 'lastName must be less than 50 characters' })
  lastName: string;

  @IsString()
  @IsOptional()
  currentCity?: string;

  @IsUrl({}, { message: 'Enter a valid website URL' })
  @IsOptional()
  website?: string;

  @IsString()
  @MaxLength(500, { message: 'About you cannot be longer than 500 characters' })
  @IsOptional()
  aboutYou?: string;
}
