import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { CreateHotelDto } from '../dto/createHotel.dto';
import { HotelService } from '../service/hotel.service';
import { Types } from 'mongoose';
import { UpdateHotelDto } from '../dto/updateHotel.dto';
import { SubmitDetailsDto } from '../dto/submitDetails.dto';

@Controller('hotelOwner')
export class HotelController {
  constructor(private readonly _hotelService: HotelService) {}
  @Post('createHotel')
  async createHotel(@Body() createHotelDto: CreateHotelDto) {
    const response = await this._hotelService.createHotel(createHotelDto);
    return response;
  }

  @Get('getHotelDetails')
  async getDetails(@Query('email') email: string) {
    return this._hotelService.getDetails(email);
  }

  @Patch('updateHotel')
  async updateHotel(
    @Query('hotelId') hotelId: string,
    @Body() UpdateHotelDto: UpdateHotelDto,
  ) {
    const newHotelId = new Types.ObjectId(hotelId);
    return this._hotelService.updateHotel(newHotelId, UpdateHotelDto);
  }

  @Get('fullDetails')
  async hotelDetails(@Query('hotelId') hotelId: string) {
    const newHotelId = new Types.ObjectId(hotelId);
    return this._hotelService.getFullDetails(newHotelId);
  }

  @Post('submitDetails')
  async submitDetails(@Body() SubmitDetailsDto: SubmitDetailsDto) {
    const submitDetails =
      await this._hotelService.submitDetails(SubmitDetailsDto);
    return submitDetails;
  }
}
