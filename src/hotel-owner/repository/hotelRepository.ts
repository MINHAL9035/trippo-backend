import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel } from '../schema/HotelSchema';
import { Model, Types } from 'mongoose';
import { HotelInterface } from '../interface/IHotel.interface';
import { UpdateHotelDto } from '../dto/updateHotel.dto';
import { SubmitDetailsDto } from '../dto/submitDetails.dto';
import { OwnerRequest } from '../schema/PendingRequest.schema';

@Injectable()
export class HotelRepository {
  constructor(
    @InjectModel(Hotel.name)
    private readonly _hotelModel: Model<Hotel>,
    @InjectModel(OwnerRequest.name)
    private readonly _OwnerRequest: Model<OwnerRequest>,
  ) {}

  async createHotel(hotelData): Promise<HotelInterface> {
    const newHotel = new this._hotelModel(hotelData);
    return await newHotel.save();
  }

  async findHotelDetails(ownerId: Types.ObjectId): Promise<HotelInterface> {
    const hotelDetails = await this._hotelModel.findOne({ ownerId: ownerId });
    return hotelDetails;
  }

  async updateHotel(
    hotelId: Types.ObjectId,
    UpdateHotelDto: UpdateHotelDto,
  ): Promise<HotelInterface> {
    const updatedHotel = await this._hotelModel.findOneAndUpdate(
      { _id: hotelId },
      { $set: { ...UpdateHotelDto } },
      { new: true, runValidators: true },
    );
    return updatedHotel;
  }

  async findHotelById(hotelId: Types.ObjectId) {
    const hotelDetails = await this._hotelModel
      .findById(hotelId)
      .populate('ownerId', '-__v')
      .lean()
      .exec();
    return hotelDetails;
  }

  async createRequest(SubmitDetailsDto: SubmitDetailsDto) {
    const hotelId = new Types.ObjectId(SubmitDetailsDto.hotelId);
    const ownerId = new Types.ObjectId(SubmitDetailsDto.ownerId);
    const newPendingRequest = new this._OwnerRequest({
      hotelId: hotelId,
      ownerId: ownerId,
    });
    return await newPendingRequest.save();
  }
}
