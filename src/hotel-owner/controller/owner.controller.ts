import { Body, Controller, Get, Patch, Post, Query, Res } from '@nestjs/common';
import { HotelOwnerOtpDto } from '../dto/hotelOwnerOtpdto';
import { UpdateOwnerDto } from '../dto/createOwner.dto';
import { HotelOwnerService } from '../service/hotelOwner.service';
import { LoginDto } from '../../auth/dto/login.dto';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Owner } from '../schema/owner.schema';
import { CompletedBooking } from '../../user/schema/completedBookings.schema';
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

    const completedStatusMatch = {
      hotelId: { $in: hotelIds },
      status: 'completed',
    };
    const cancelledStatusMatch = {
      hotelId: { $in: hotelIds },
      status: 'cancelled',
    };

    const totalBookings = await this._completedBooking.countDocuments({
      hotelId: { $in: hotelIds },
    });

    const completedBooking =
      await this._completedBooking.countDocuments(completedStatusMatch);
    const cancelledBooking =
      await this._completedBooking.countDocuments(cancelledStatusMatch);

    const totalRevenue = await this._completedBooking.aggregate([
      {
        $match: completedStatusMatch,
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await this._completedBooking.aggregate([
      {
        $match: {
          ...completedStatusMatch,
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const yearlyRevenue = await this._completedBooking.aggregate([
      {
        $match: {
          ...completedStatusMatch,
          createdAt: {
            $gte: new Date(currentYear - 4, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { $year: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return {
      totalBookings,
      completedBooking,
      cancelledBooking,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue.map((item) => ({
        month: new Date(2024, item._id - 1).toLocaleString('default', {
          month: 'short',
        }),
        revenue: item.revenue,
      })),
      yearlyRevenue: yearlyRevenue.map((item) => ({
        year: item._id,
        revenue: item.revenue,
      })),
    };
  }
}
