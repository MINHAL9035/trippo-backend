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
import { FileSizeValidationPipe } from 'src/common/pipes/file-size-validation.pipe';

@UseGuards(JwtUserGuard)
@Controller('trip')
export class TripController {
  private readonly _logger = new Logger(TripController.name);
  constructor(
    private readonly _tripService: TripService,
    private readonly _s3Service: S3Service,
  ) {}

  @Post('create')
  @UseInterceptors(
    FileInterceptor('tripImage', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async createTrip(
    @Req() request,
    @UploadedFile(new FileSizeValidationPipe()) tripImage: Express.Multer.File,
    @Body() tripDto: TripDto,
  ) {
    try {
      const userId = request.user._id;

      const uploadedImage = await this._s3Service.uploadFile(tripImage);
      delete tripImage.buffer;

      const trip = await this._tripService.create(
        tripDto,
        uploadedImage.Location,
        userId,
      );

      this._logger.log('Trip created successfully');
      return {
        message: 'Trip created successfully',
        trip,
      };
    } catch (error) {
      this._logger.error('Error in createTrip:', error);
      throw error;
    }
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
