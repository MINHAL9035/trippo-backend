import { Body, Controller, Get, Patch, Post, Query, Res } from '@nestjs/common';
import { HotelOwnerOtpDto } from '../dto/hotelOwnerOtpdto';
import { UpdateOwnerDto } from '../dto/createOwner.dto';
import { HotelOwnerService } from '../service/hotelOwner.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { Response } from 'express';
import { Types } from 'mongoose';

@Controller('hotelOwner')
export class OwnerController {
  constructor(private readonly _hotelOwnerService: HotelOwnerService) {}

  @Post('sendOtp')
  async sendOtp(@Body('email') email: string) {
    await this._hotelOwnerService.sendOtp(email);
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
}
