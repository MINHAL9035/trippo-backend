import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel } from '../schema/HotelSchema';
import { Model, Types } from 'mongoose';
import { HotelInterface } from '../interface/IHotel.interface';
import { UpdateHotelDto } from '../dto/updateHotel.dto';
import { SubmitDetailsDto } from '../dto/submitDetails.dto';
import { OwnerRequest } from '../schema/PendingRequest.schema';
import { UnverifiedHotel } from '../schema/UnverifiedHotel';
import { EditHotelDto } from '../dto/editHotel.dto';
import { CompletedBooking } from 'src/user/schema/completedBookings.schema';

@Injectable()
export class HotelRepository {
  constructor(
    @InjectModel(Hotel.name)
    private readonly _hotelModel: Model<Hotel>,
    @InjectModel(UnverifiedHotel.name)
    private readonly _unverifiedHotel: Model<UnverifiedHotel>,
    @InjectModel(OwnerRequest.name)
    private readonly _OwnerRequest: Model<OwnerRequest>,
    @InjectModel(CompletedBooking.name)
    private readonly _completedBookingModel: Model<CompletedBooking>,
  ) {}

  async createHotel(hotelData): Promise<HotelInterface> {
    const newHotel = new this._unverifiedHotel(hotelData);
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
    const updatedHotel = await this._unverifiedHotel.findOneAndUpdate(
      { _id: hotelId },
      { $set: { ...UpdateHotelDto } },
      { new: true, runValidators: true },
    );
    return updatedHotel;
  }

  async findHotelById(hotelId: Types.ObjectId) {
    const hotelDetails = await this._unverifiedHotel
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

  async find(hotelId: Types.ObjectId) {
    return await this._hotelModel.findOne({ _id: hotelId });
  }
  async findVerifiedHotel(hotelId: Types.ObjectId) {
    return await this._hotelModel.findOne({ _id: hotelId });
  }

  async findByIdAndUpdate(hotelId: Types.ObjectId, updateData) {
    return this._hotelModel
      .findByIdAndUpdate(hotelId, updateData, { new: true })
      .exec();
  }

  async editHotelInfo(
    hotelId: Types.ObjectId,
    updatedHotelData: EditHotelDto,
  ): Promise<Hotel> {
    return this._hotelModel
      .findByIdAndUpdate(hotelId, { $set: updatedHotelData }, { new: true })
      .exec();
  }

  async findBookings(ownerId: Types.ObjectId) {
    const ownerHotels = await this._hotelModel.find({ ownerId: ownerId });
    const hotelIds = ownerHotels.map((hotel) => hotel._id);
    const bookings = await this._completedBookingModel
      .find({ hotelId: { $in: hotelIds } })
      .populate('hotelId')
      .populate('userId')
      .sort({ createdAt: -1 });
    return bookings;
  }

  async findOwnerBookingDetails(bookingId: string) {
    return this._completedBookingModel
      .findOne({ bookingId: bookingId })
      .populate('userId')
      .populate('hotelId');
  }
}
