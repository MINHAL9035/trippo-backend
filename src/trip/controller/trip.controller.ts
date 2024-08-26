import { Body, Controller, Logger, Post } from '@nestjs/common';
import { TripDto } from '../dto/createTrip.dto';
import { TripService } from '../service/trip.service';

@Controller('trip')
export class TripController {
  private readonly _logger = new Logger(TripController.name);
  constructor(private readonly _tripService: TripService) {}

  @Post('create')
  async createTrip(@Body() tripDto: TripDto) {
    this._logger.log(`Trip Created: ${JSON.stringify(tripDto)}`);
    try {
      const trip = await this._tripService.create(tripDto);
      return {
        message: 'Trip crated successfullly',
        trip,
      };
    } catch (error) {
      this._logger.error(`Error craeting trip: ${error.message}`, error.stack);
      throw error;
    }
  }
}
