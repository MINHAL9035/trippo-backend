import { Body, Controller, Get, Patch, Post, Query, Res } from '@nestjs/common';
import { HotelOwnerOtpDto } from '../dto/hotelOwnerOtpdto';
import { UpdateOwnerDto } from '../dto/createOwner.dto';
import { HotelOwnerService } from '../service/hotelOwner.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Owner } from '../schema/owner.schema';
import { CompletedBooking } from 'src/user/schema/completedBookings.schema';
import { Hotel } from '../schema/HotelSchema';

@Controller('hotelOwner')
export class OwnerController {
  constructor(
    private readonly _hotelOwnerService: HotelOwnerService,
    @InjectModel(Owner.name) private _ownerModel: Model<Owner>,
    @InjectModel(CompletedBooking.name)
    private _completedBooking: Model<CompletedBooking>,
    @InjectModel(Hotel.name)
    private readonly _hotelModel: Model<Hotel>,
  ) {}

  @Post('sendOtp')
  async sendOtp(@Body('email') email: string) {
    try {
      const existingOwner = await this._ownerModel.findOne({ email });
      if (existingOwner) {
        throw new Error('Already registered use owner login');
      } else {
        await this._hotelOwnerService.sendOtp(email);
      }
    } catch (error) {
      throw error;
    }
  }

  @Post('verifyOtp')
  async verifyOtp(@Body() hotelOwnerOtpDto: HotelOwnerOtpDto) {
    const response = await this._hotelOwnerService.verifyOtp(
      hotelOwnerOtpDto.email,
      hotelOwnerOtpDto.otp,
    );
    return response;
  }

  @Get('getDetails')
  async getUserDetails(@Query('email') email: string) {
    return this._hotelOwnerService.getUserDetails(email);
  }

  @Patch('updateDetails')
  async updateOwner(@Body() updateOwnerDto: UpdateOwnerDto) {
    return this._hotelOwnerService.updateOwner(updateOwnerDto);
  }

  @Post('loginOwner')
  async ownerLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this._hotelOwnerService.loginOwner(loginDto, res);
    return result;
  }

  @Post('logoutOwner')
  async ownerLogout(@Res({ passthrough: true }) res: Response) {
    return await this._hotelOwnerService.logout(res);
  }

  @Get('getOwnerHotels')
  async getOwnerHotels(@Query('ownerId') ownerId: string) {
    const newOwnerId = new Types.ObjectId(ownerId);
    return await this._hotelOwnerService.getOwnerHotels(newOwnerId);
  }

  @Get('ownerDashboard')
  async getOwnerDashBoard(@Query('ownerId') ownerId: string) {
    const newOwnerId = new Types.ObjectId(ownerId);
    const hotels = await this._hotelModel.find({ ownerId: newOwnerId });
    const hotelIds = hotels.map((hotel) => hotel._id);
    const totalBookings = await this._completedBooking.countDocuments({
      hotelId: { $in: hotelIds },
    });
    return totalBookings;
  }
}
