import { Types } from 'mongoose';
export interface IPostInterface {
  imageUrl: string[];
  description: string;
  place: string;
  userId: Types.ObjectId;
}
