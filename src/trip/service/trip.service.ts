import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ITripService } from '../interface/ITripService';
import { Triprepository } from '../repository/tripRepository';
import { TripDto } from '../dto/createTrip.dto';
import { ITrip } from '../interface/Itrip.interface';
import { Types } from 'mongoose';

@Injectable()
export class TripService implements ITripService {
  private readonly _logger = new Logger(TripService.name);
  constructor(private readonly _tripRepository: Triprepository) {}

  async create(
    tripDto: TripDto,
    imageLocation: string,
    userId: Types.ObjectId,
  ): Promise<ITrip> {
    const existingTripName = await this._tripRepository.findTrip(
      tripDto.tripName,
    );
    if (existingTripName) {
      throw new ConflictException('Change trip name. Trip name already exists');
    }
    const tripData: ITrip = {
      ...tripDto,
      imageUrl: imageLocation,
      tripStartDate: new Date(tripDto.tripStartDate),
      tripEndDate: new Date(tripDto.tripEndDate),
      userId,
    };
    return await this._tripRepository.createTrip(tripData);
  }

  async tripDetails(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<{ trips: ITrip[]; totalCount: number; hasMore: boolean }> {
    try {
      const [trips, totalCount] = await Promise.all([
        this._tripRepository.findTripsByPage(userId, page, limit),
        this._tripRepository.countTrips(userId),
      ]);
      const hasMore = totalCount > page * limit;
      return { trips, totalCount, hasMore };
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }
}
