import { Injectable } from '@nestjs/common';
import { ITripRepository } from '../interface/ITripRepository';
import { InjectModel } from '@nestjs/mongoose';
import { Trip } from '../schema/tripSchema';
import { Model } from 'mongoose';
import { ITrip } from '../interface/Itrip.interface';

@Injectable()
export class Triprepository implements ITripRepository {
  constructor(@InjectModel(Trip.name) private _tripModel: Model<Trip | null>) {}

  async findTrip(tripName: string): Promise<ITrip> {
    return await this._tripModel.findOne({ tripName }).exec();
  }

  async createTrip(tripData: ITrip): Promise<ITrip> {
    const newTrip = new this._tripModel(tripData);
    return await newTrip.save();
  }
}
