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
import { UserRegistrationDto } from '../Dto/user.registration.dto';
import { OtpService } from '../service/otp.service';
import { VerifyOtpDto } from '../Dto/verifyOtp.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly OtpService: OtpService,
  ) {}

  @Post('/register')
  async register(@Body() userDto: UserRegistrationDto) {
    const user = await this.userService.register(userDto);
    const { firstName, lastName, email } = user;
    await this.OtpService.sendOtp(userDto.email);
    return {
      message: 'User registered and OTP sent',
      user: { firstName, lastName, email },
    };
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() VerifyOtpDto: VerifyOtpDto) {
    console.log('my controller otp', VerifyOtpDto);
    try {
      await this.OtpService.verifyOtp(VerifyOtpDto.email, VerifyOtpDto.otp);
      await this.userService.verifyUser(VerifyOtpDto.email);
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

  @Post('/resent-otp')
  async resendOtp(@Body('email') email: string) {
    try {
      await this.OtpService.sendOtp(email);
    } catch (error) {
      console.log(error);
    }
  }
}
