import { TripDto } from '../dto/createTrip.dto';
import { ITrip } from './Itrip.interface';
import { Types } from 'mongoose';

export interface ITripService {
  create(
    TripDto: TripDto,
    imageLocation: string,
    userId: Types.ObjectId,
  ): Promise<ITrip>;
  tripDetails(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<{ trips: ITrip[]; totalCount: number; hasMore: boolean }>;
}
