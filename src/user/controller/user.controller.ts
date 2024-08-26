import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserRegistrationDto } from '../dto/user.registration.dto';
import { OtpService } from '../service/otp.service';
import { VerifyOtpDto } from '../dto/verifyOtp.dto';
import { UserRepository } from '../repository/user.repository';

@Controller('users')
export class UserController {
  private readonly _logger = new Logger(UserController.name);

  constructor(
    private readonly _userService: UserService,
    private readonly _otpService: OtpService,
    private readonly _userRepository: UserRepository,
  ) {}

  /**
   * Registers a new user and sends an OTP to their email.
   * @param userDto - Data Transfer Object containing user registration details.
   * @returns - A confirmation message with the registered user's details.
   */
  @Post('register')
  async register(@Body() userDto: UserRegistrationDto) {
    this._logger.log(`Registering new user: ${userDto.email}`);
    try {
      const user = await this._userService.register(userDto);
      const { firstName, lastName, email } = user;
      await this._otpService.sendOtp(email);
      this._logger.log(`User registered and OTP sent: ${email}`);
      return {
        message: 'User registered and OTP sent',
        user: { firstName, lastName, email },
      };
    } catch (error) {
      this._logger.error(
        `Error registering user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Verifies the OTP provided by the user.
   * @param verifyOtpDto - Data Transfer Object containing the email and OTP for verification.
   * @returns - A success message if OTP verification is successful.
   */
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    this._logger.log(`Verifying OTP for: ${verifyOtpDto.email}`);
    try {
      await this._otpService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
      await this._userService.verifyUser(verifyOtpDto.email);
      this._logger.log(`OTP verified successfully for: ${verifyOtpDto.email}`);
      const user = await this._userRepository.findByEmail(verifyOtpDto.email);
      const { firstName, lastName, email } = user;
      return {
        message: 'OTP verified successfully',
        user: { firstName, lastName, email },
      };
    } catch (error) {
      this._logger.error(`Error verifying OTP: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Resends the OTP to the user's email.
   * @param email - The user's email address.
   */
  @Post('resend-otp')
  async resendOtp(@Body('email') email: string) {
    this._logger.log(`Resending OTP to: ${email}`);
    try {
      await this._otpService.sendOtp(email);
      this._logger.log(`OTP resent successfully to: ${email}`);
      return { message: 'OTP resent successfully' };
    } catch (error) {
      this._logger.error(`Error resending OTP: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('getUserDetails')
  async getUserDetails(@Query('email') email: string) {
    return this._userService.getUserDetails(email);
  }
}
