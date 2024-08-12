import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserRegistrationDto } from '../dto/user.registration.dto';
import { OtpService } from '../service/otp.service';
import { VerifyOtpDto } from '../dto/verifyOtp.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly _userService: UserService,
    private readonly _otpService: OtpService,
  ) {}

  /**
   * Registers a new user and sends an OTP to their email.
   * @param userDto - Data Transfer Object containing user registration details.
   * @returns - A confirmation message with the registered user's details.
   */
  @Post('register')
  async register(@Body() userDto: UserRegistrationDto) {
    const user = await this._userService.register(userDto);
    const { firstName, lastName, email } = user;
    await this._otpService.sendOtp(userDto.email);
    return {
      message: 'User registered and OTP sent',
      user: { firstName, lastName, email },
    };
  }

  /**
   * Verifies the OTP provided by the user.
   * @param VerifyOtpDto - Data Transfer Object containing the email and OTP for verification.
   * @returns - A success message if OTP verification is successful.
   */
  @Post('verify-otp')
  async verifyOtp(@Body() VerifyOtpDto: VerifyOtpDto) {
    console.log('my controller otp', VerifyOtpDto);
    try {
      await this._otpService.verifyOtp(VerifyOtpDto.email, VerifyOtpDto.otp);
      await this._userService.verifyUser(VerifyOtpDto.email);
      return { message: 'OTP verified successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'An unexpected error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Resends the OTP to the user's email.
   * @param email - The user's email address.
   */
  @Post('resent-otp')
  async resendOtp(@Body('email') email: string) {
    try {
      await this._otpService.sendOtp(email);
    } catch (error) {
      console.log(error);
    }
  }
}
