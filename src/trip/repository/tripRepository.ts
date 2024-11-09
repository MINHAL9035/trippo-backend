import { Injectable } from '@nestjs/common';
import { ITripRepository } from '../interface/ITripRepository';
import { InjectModel } from '@nestjs/mongoose';
import { Trip } from '../schema/tripSchema';
import { Model, Types } from 'mongoose';
import { ITrip } from '../interface/Itrip.interface';
import { SavedPlace } from '../schema/savePlace.schema';

@Injectable()
export class Triprepository implements ITripRepository {
  constructor(
    @InjectModel(Trip.name) private _tripModel: Model<Trip>,
    @InjectModel(SavedPlace.name)
    private readonly _savePlaceModel: Model<SavedPlace>,
  ) {}

  async findTrip(tripName: string): Promise<ITrip | null> {
    return this._tripModel.findOne({ tripName }).exec();
  }

  async findTripsByPage(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<ITrip[]> {
    return await this._tripModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<ITrip[]>()
      .exec();
  }

  async countTrips(userId: Types.ObjectId): Promise<number> {
    return await this._tripModel.countDocuments({ userId });
  }

  async createTrip(tripData: ITrip): Promise<ITrip> {
    const newTrip = new this._tripModel(tripData);
    return await newTrip.save();
  }

  async findMyTrips(userId: Types.ObjectId) {
    return await this._tripModel.find({ userId: userId }).populate('userId');
  }

  async findMyTripDetails(tripId: Types.ObjectId) {
    console.log('sd', tripId);

    return await this._savePlaceModel
      .find({ tripId: tripId })
      .populate('tripId');
  }
}
