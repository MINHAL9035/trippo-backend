import { ConflictException, Injectable } from '@nestjs/common';
import { ITripService } from '../interface/ITripService';
import { Triprepository } from '../repository/tripRepository';
import { TripDto } from '../dto/createTrip.dto';
import { ITrip } from '../interface/Itrip.interface';

@Injectable()
export class TripService implements ITripService {
  constructor(private readonly _tripRepository: Triprepository) {}

  async create(TripDto: TripDto): Promise<ITrip> {
    const existingTripName = await this._tripRepository.findTrip(
      TripDto.tripName,
    );
    if (existingTripName) {
      throw new ConflictException('chaneg trip name.Trip name already exist');
    }
    return await this._tripRepository.createTrip(TripDto);
  }
}
