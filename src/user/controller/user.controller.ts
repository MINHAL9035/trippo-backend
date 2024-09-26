import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserRegistrationDto } from '../dto/user.registration.dto';
import { OtpService } from '../service/otp.service';
import { VerifyOtpDto } from '../dto/verifyOtp.dto';
import { Types } from 'mongoose';
import { PendingBookingDto } from '../dto/pendingBooking.dto';

@Controller('users')
export class UserController {
  private readonly _logger = new Logger(UserController.name);

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
    await this._otpService.sendOtp(email);
    this._logger.log(`User registered and OTP sent: ${email}`);
    return {
      message: 'User registered and OTP sent',
      user: { firstName, lastName, email },
    };
  }

  /**
   * Verifies the OTP provided by the user.
   * @param verifyOtpDto - Data Transfer Object containing the email and OTP for verification.
   * @returns - A success message if OTP verification is successful.
   */
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    await this._otpService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
    const user = await this._userService.verifyUser(verifyOtpDto.email);
    const { firstName, lastName, email } = user;
    return {
      message: 'OTP verified successfully',
      user: { firstName, lastName, email },
    };
  }

  /**
   * Resends the OTP to the user's email.
   * @param email - The user's email address.
   * @returns - A success message if OTP is resent successfully.
   */
  @Post('resend-otp')
  async resendOtp(@Body('email') email: string) {
    this._logger.log(`Resending OTP to: ${email}`);
    await this._otpService.sendOtp(email);
    this._logger.log(`OTP resent successfully to: ${email}`);
    return { message: 'OTP resent successfully' };
  }

  @Post('searchResults')
  async searchHotels(@Body() searchData: any) {
    return this._userService.searchHotels(searchData);
  }

  @Get('getHotelDetails/:id')
  async getSingleHotelDetails(@Param('id') id: string) {
    const hotelId = new Types.ObjectId(id);
    return this._userService.getSingleHotelDetails(hotelId);
  }

  @Post('pendingBookings')
  async pendingBookings(@Body() PendingBookingDto: PendingBookingDto) {
    console.log('dfd', PendingBookingDto);

    const pendingBooking =
      await this._userService.createPendingBooking(PendingBookingDto);
    return pendingBooking;
  }

  @Get('getBookingDetails')
  async getBookingDetails(@Query('bookingId') bookingId: string) {
    return await this._userService.getBookingDetails(bookingId);
  }
}
