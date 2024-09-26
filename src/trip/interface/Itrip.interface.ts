import { Types } from 'mongoose';
export interface ITrip {
  tripName: string;
  destination: string;
  imageUrl: string;
  tripStartDate: Date;
  tripEndDate: Date;
  userId: Types.ObjectId;
}
