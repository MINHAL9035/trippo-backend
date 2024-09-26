import { ITrip } from './Itrip.interface';
import { Types } from 'mongoose';

export interface ITripRepository {
  findTrip(tripName: string): Promise<ITrip | null>;
  findTripsByPage(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<ITrip[]>;
  createTrip(tripData: ITrip): Promise<ITrip>;
}
