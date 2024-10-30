import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TripDto } from '../dto/createTrip.dto';
import { TripService } from '../service/trip.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/aws/aws.service';
import { JwtUserGuard } from 'src/guards/jwtUserAuth.guard';
import { Types } from 'mongoose';
import { CreateAiTripDto } from '../dto/aiTripCreation.dto';
@UseGuards(JwtUserGuard)
@Controller('trip')
export class TripController {
  private readonly _logger = new Logger(TripController.name);
  constructor(
    private readonly _tripService: TripService,
    private readonly _s3Service: S3Service,
  ) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('tripImage'))
  async createTrip(
    @Req() request,
    @UploadedFile() tripImage: Express.Multer.File,
    @Body() tripDto: TripDto,
  ) {
    const userId = request.user._id;
    const Image = await this._s3Service.uploadFile(tripImage);
    const trip = await this._tripService.create(
      tripDto,
      Image.Location,
      userId,
    );
    tripImage.buffer = null;
    this._logger.log('my created trip', trip);
    return {
      message: 'Trip created successfully',
      trip,
    };
  }

  @Get('tripDetails')
  async tripDetails(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    console.log(userId);
    const newUserId = new Types.ObjectId(userId);
    return this._tripService.tripDetails(newUserId, page, limit);
  }

  @Post('ai-trip')
  async create(@Req() request, @Body() createAiTripDto: CreateAiTripDto) {
    console.log('my trip data', createAiTripDto);
    const userId = request.user._id;
    const result = await this._tripService.createAiTrip(
      createAiTripDto,
      userId,
    );
    return result;
  }

  @Get('ai-trip-details')
  async getAiTrip(@Query('tripId') tripId: string) {
    return this._tripService.getAiTrip(tripId);
  }
}
