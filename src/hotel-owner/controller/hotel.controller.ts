import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateHotelDto } from '../dto/createHotel.dto';
import { HotelService } from '../service/hotel.service';
import { Model, Types } from 'mongoose';
import { UpdateHotelDto } from '../dto/updateHotel.dto';
import { SubmitDetailsDto } from '../dto/submitDetails.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel } from '../schema/HotelSchema';
import { EditHotelDto } from '../dto/editHotel.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/aws/aws.service';
import { JwtOwnerGuard } from 'src/guards/jwtOwner.guard';
import { FileSizeValidationPipe } from 'src/common/pipes/file-size-validation.pipe';

@Controller('hotelOwner')
export class HotelController {
  private readonly _logger = new Logger(HotelController.name);
  constructor(
    private readonly _hotelService: HotelService,
    @InjectModel(Hotel.name)
    private readonly _hotelModel: Model<Hotel>,
    private readonly _s3Service: S3Service,
  ) {}
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

  @Get('hotelDetails')
  async fetchHotelDetails(@Query('hotelId') hotelId: string) {
    const newHotelId = new Types.ObjectId(hotelId);
    return (await this._hotelModel.findOne({ _id: newHotelId })).populate(
      'ownerId',
    );
  }
  @Patch('editHotel')
  async editHotel(
    @Body() editHotelDto: EditHotelDto,
    @Query('hotelId') hotelId: string,
  ) {
    const newHotelId = new Types.ObjectId(hotelId);
    return await this._hotelService.editHotel(editHotelDto, newHotelId);
  }

  @Patch('editHotelInfo')
  @UseInterceptors(
    FilesInterceptor('hotelImages', 10, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
      },
    }),
  )
  async editHotelInfo(
    @Body() editHotelDto: EditHotelDto,
    @Query('hotelId') hotelId: string,
    @UploadedFiles(new FileSizeValidationPipe())
    hotelImages: Array<Express.Multer.File>,
  ) {
    try {
      const newHotelId = new Types.ObjectId(hotelId);

      // Process images sequentially instead of parallel
      const imageLocations = [];
      for (const image of hotelImages) {
        try {
          const uploaded = await this._s3Service.uploadFile(image);
          imageLocations.push(uploaded.Location);
        } finally {
          // Clear the buffer after upload
          delete image.buffer;
        }
      }

      const updatedHotelData = {
        ...editHotelDto,
        images: imageLocations,
      };

      return this._hotelService.editHotelInfo(newHotelId, updatedHotelData);
    } catch (error) {
      this._logger.error('Error in editHotelInfo:', error);
      throw error;
    }
  }

  @Get('hotelDetails')
  async getFullHotelDetails(@Query('hotelId') hotelId: string) {
    const newHotelId = new Types.ObjectId(hotelId);
    return this._hotelService.getFullDetails(newHotelId);
  }

  @UseGuards(JwtOwnerGuard)
  @Get('bookings')
  async getBookings(@Req() request) {
    const ownerId = request.owner._id;
    return this._hotelService.findBookings(ownerId);
  }

  @Get('bookingDetails-owner')
  async ownerBookigDetails(@Query('bookingId') bookingId: string) {
    return this._hotelService.findOwnerBookingDetails(bookingId);
  }
}
