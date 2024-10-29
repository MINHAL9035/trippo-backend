import { IsEmail, IsInt } from 'class-validator';

export class HotelOwnerOtpDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsInt({ message: 'OTP must be an integer' })
  otp: number;
}
