import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserRegistrationDto {
  @IsString()
  @MinLength(4, { message: 'FirstName must be at least 2 character long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  fullName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  userName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  role: 'user' | 'admin';
}
