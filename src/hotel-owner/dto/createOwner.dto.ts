import { IsEmail, IsString } from 'class-validator';

export class UpdateOwnerDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  mobileNumber: string;

  @IsString()
  password: string;
}
