import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from '../interface/user/IUser.interface';
import { User } from '../schema/user.schema';
import { UnverifiedUser } from '../schema/UnverifiedUser.schema';
import { UnverifiedUserInterface } from '../interface/user/IUnverifiedUser.interface';
import { IUserRepository } from '../interface/user/IuserRepository.interface';
import { Types } from 'mongoose';
import { PendingBooking } from '../schema/pendingBooking.schema';
import { PendingBookingDto } from '../dto/pendingBooking.dto';
import { CompletedBooking } from '../schema/completedBookings.schema';
import { SearchState } from '../interface/user/ISearchData.interface';
import { Wallet } from '../schema/wallet.schema';
import { Hotel } from '../../hotel-owner/schema/HotelSchema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name)
    private _userModel: Model<User>,
    @InjectModel(UnverifiedUser.name)
    private _UnverifiedUserModel: Model<UnverifiedUser>,
    @InjectModel(Hotel.name)
    private _hotel: Model<Hotel>,
    @InjectModel(PendingBooking.name)
    private _pendingBooking: Model<PendingBooking>,
    @InjectModel(CompletedBooking.name)
    private _completedBooking: Model<CompletedBooking>,
    @InjectModel(Wallet.name)
    private _walletModel: Model<Wallet>,
  ) {}

  async createUser(userData: UserInterface): Promise<UserInterface> {
    const newUser = new this._userModel(userData);
    return await newUser.save();
  }

  async createUnverifiedUser(
    userData: UnverifiedUserInterface,
  ): Promise<UnverifiedUserInterface> {
    const newUnverifiedUser = new this._UnverifiedUserModel(userData);
    return await newUnverifiedUser.save();
  }

  async findByEmail(email: string): Promise<UserInterface | null> {
    return await this._userModel.findOne({ email }).exec();
  }

  async findByUsername(userName: string): Promise<User | null> {
    return await this._userModel.findOne({ userName }).exec();
  }

  async findUnverifiedUser(
    email: string,
  ): Promise<UnverifiedUserInterface | null> {
    return await this._UnverifiedUserModel.findOne({ email }).exec();
  }

  async deleteUnverifiedUser(email: string): Promise<void> {
    await this._UnverifiedUserModel.deleteOne({ email }).exec();
  }
  async findHotels(searchData: SearchState) {
    console.log('searchState', searchData);
    try {
      const checkInDate = new Date(searchData.checkInDate);
      const checkOutDate = new Date(searchData.checkOutDate);
      const totalGuests = searchData.guests.adults + searchData.guests.children;
      const requiredRooms = searchData.guests.rooms;

      const hotels = await this._hotel.aggregate([
        {
          $match: {
            place: searchData.selectedPlace,
          },
        },
        {
          $unwind: '$rooms',
        },
        {
          $match: {
            'rooms.capacity': { $gte: Math.ceil(totalGuests / requiredRooms) },
            'rooms.available': { $gte: requiredRooms },
            $and: [
              { 'rooms.availableDates.0': { $lte: checkInDate } },
              { 'rooms.availableDates.1': { $gte: checkOutDate } },
            ],
          },
        },
        {
          $group: {
            _id: '$_id',
            ownerId: { $first: '$ownerId' },
            hotelName: { $first: '$hotelName' },
            streetAddress: { $first: '$streetAddress' },
            place: { $first: '$place' },
            state: { $first: '$state' },
            country: { $first: '$country' },
            isVerified: { $first: '$isVerified' },
            description: { $first: '$description' },
            images: { $first: '$images' },
            hotelType: { $first: '$hotelType' },
            amenities: { $first: '$amenities' },
            availableRooms: {
              $push: '$rooms',
            },
          },
        },
        {
          $sort: {
            'availableRooms.rate': 1,
          },
        },
      ]);

      console.log('my searched hotels', hotels);
      return hotels;
    } catch (error) {
      throw error;
    }
  }
  async findHotelById(hotelId: Types.ObjectId) {
    return await this._hotel.findById(hotelId);
  }

  private generateBookingId(): string {
    const prefix = 'TRP';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomNum}`;
  }

  async createPendingBooking(PendingBookingDto: PendingBookingDto) {
    try {
      const bookingId = this.generateBookingId();

      const checkIn = new Date(PendingBookingDto.checkIn);
      const checkOut = new Date(PendingBookingDto.checkOut);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      );

      const totalPrice =
        PendingBookingDto.roomRate * PendingBookingDto.rooms * nights;

      const pendingBooking = new this._pendingBooking({
        bookingId,
        checkIn: PendingBookingDto.checkIn,
        checkOut: PendingBookingDto.checkOut,
        hotelId: new Types.ObjectId(PendingBookingDto.hotelId),
        roomId: PendingBookingDto.roomId,
        userId: new Types.ObjectId(PendingBookingDto.userId),
        roomRate: PendingBookingDto.roomRate,
        rooms: PendingBookingDto.rooms,
        totalPrice,
        nights: nights,
        status: 'pending',
      });

      const savedBooking = await pendingBooking.save();
      return {
        ...savedBooking.toObject(),
        nights,
      };
    } catch (error) {
      throw new Error('Failed to create pending booking');
    }
  }

  async findBookingDetails(bookingId: string) {
    const bookingDetails = await this._pendingBooking
      .findOne({ bookingId: bookingId })
      .populate('userId')
      .populate('hotelId');
    return bookingDetails;
  }

  async findCompletedBooking(bookingId: string) {
    const bookingDetails = await this._completedBooking
      .findOne({ bookingId: bookingId })
      .populate('userId')
      .populate('hotelId');

    return bookingDetails;
  }

  async findUserBookings(userId: Types.ObjectId) {
    try {
      const userBookings = await this._completedBooking
        .find({ userId: userId, status: 'completed' })
        .populate('userId')
        .populate('hotelId')
        .lean();
      return userBookings;
    } catch (error) {
      console.error('Repository error:', error);
      throw error;
    }
  }
  async findUserCancelBookings(userId: Types.ObjectId) {
    try {
      const userBookings = await this._completedBooking
        .find({ userId: userId, status: 'cancelled' })
        .populate('userId')
        .populate('hotelId')
        .lean();
      return userBookings;
    } catch (error) {
      console.error('Repository error:', error);
      throw error;
    }
  }
  async findUserById(userId: string): Promise<User> {
    return this._userModel.findById(userId).exec();
  }
  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    return this._userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
  }

  async findWallet(userId: string) {
    const newUserId = new Types.ObjectId(userId);
    const wallet = await this._walletModel.findOne({ userId: newUserId });
    console.log('wallet', wallet);
    return wallet;
  }
}
