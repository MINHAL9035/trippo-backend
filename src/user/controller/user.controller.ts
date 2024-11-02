import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserRegistrationDto } from '../dto/user.registration.dto';
import { OtpService } from '../service/otp.service';
import { VerifyOtpDto } from '../dto/verifyOtp.dto';
import { Types } from 'mongoose';
import { PendingBookingDto } from '../dto/pendingBooking.dto';
import { JwtUserGuard } from '../../guards/jwtUserAuth.guard';
import { SearchState } from '../interface/user/ISearchData.interface';
import { ProfileService } from '../service/profile.service';

@Controller('users')
export class UserController {
  private readonly _logger = new Logger(UserController.name);

  constructor(
    private readonly _userService: UserService,
    private readonly _profileService: ProfileService,
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
    const { fullName, userName, email } = user;
    await this._otpService.sendOtp(email);
    this._logger.log(`User registered and OTP sent: ${email}`);
    return {
      message: 'User registered and OTP sent',
      user: { fullName, userName, email },
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
    const { fullName, userName, email } = user;
    return {
      message: 'OTP verified successfully',
      user: { fullName, userName, email },
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
  async searchHotels(@Body() searchData: SearchState) {
    return this._userService.searchHotels(searchData);
  }

  @Get('getHotelDetails/:id')
  async getSingleHotelDetails(@Param('id') id: string) {
    const hotelId = new Types.ObjectId(id);
    return this._userService.getSingleHotelDetails(hotelId);
  }

  @Post('pendingBookings')
  async pendingBookings(@Body() PendingBookingDto: PendingBookingDto) {
    console.log('pendingBookings', PendingBookingDto);
    const pendingBooking =
      await this._userService.createPendingBooking(PendingBookingDto);
    return pendingBooking;
  }

  @Get('getBookingDetails')
  async getBookingDetails(@Query('bookingId') bookingId: string) {
    return await this._userService.getBookingDetails(bookingId);
  }

  @Get('completedBookings')
  async getCompletedbookings(@Query('bookingId') bookingId: string) {
    return await this._userService.getCompletedBooking(bookingId);
  }

  @UseGuards(JwtUserGuard)
  @Get('bookings')
  async userBookings(@Req() request) {
    try {
      const userId = request.user._id;
      const bookings = await this._userService.getuserBookings(userId);
      return bookings;
    } catch (error) {
      console.error('Controller error:', error);
      throw error;
    }
  }
  @UseGuards(JwtUserGuard)
  @Get('cancelled')
  async userCancelledBookings(@Req() request) {
    try {
      const userId = request.user._id;
      const bookings = await this._userService.getCancelledBookings(userId);
      return bookings;
    } catch (error) {
      console.error('Controller error:', error);
      throw error;
    }
  }

  @Post('cancelBooking')
  async cancelBooking(@Body('bookingId') bookingId: string) {
    await this._profileService.cancelBooking(bookingId);
    return { message: 'Booking cancelled successfully' };
  }

  @Get('wallet')
  async getUserWallet(@Query('userId') userId: string) {
    return this._profileService.getUserWallet(userId);
  }
}
