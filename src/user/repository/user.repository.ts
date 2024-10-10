import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from '../interface/user/IUser.interface';
import { User } from '../schema/user.schema';
import { UnverifiedUser } from '../schema/UnverifiedUser.schema';
import { UnverifiedUserInterface } from '../interface/user/IUnverifiedUser.interface';
import { IUserRepository } from '../interface/user/IuserRepository.interface';
import { Hotel } from 'src/hotel-owner/schema/HotelSchema';
import { Types } from 'mongoose';
import { PendingBooking } from '../schema/pendingBooking.schema';
import { PendingBookingDto } from '../dto/pendingBooking.dto';
import { CompletedBooking } from '../schema/completedBookings.schema';

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

  async findHotels(searchData: any) {
    try {
      const { destination, checkIn, checkOut } = searchData;
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const hotels = await this._hotel.aggregate([
        {
          $match: {
            place: destination,
            isVerified: true,
          },
        },
        {
          $unwind: '$rooms',
        },
        {
          $match: {
            $and: [
              {
                'rooms.available': { $gt: 0 },
                'rooms.availableDates': {
                  $all: [
                    { $elemMatch: { $gte: checkInDate, $lte: checkOutDate } },
                  ],
                },
              },
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
            description: { $first: '$description' },
            images: { $first: '$images' },
            hotelType: { $first: '$hotelType' },
            amenities: { $first: '$amenities' },
            isVerified: { $first: '$isVerified' },
            rooms: { $push: '$rooms' },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);

      return hotels;
    } catch (error) {
      console.log(error);

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
    const { userId, hotelId } = PendingBookingDto.toDocument();
    const filter = { userId, hotelId };
    const bookingId = this.generateBookingId();

    const updatedBooking = await this._pendingBooking.findOneAndUpdate(
      filter,
      {
        ...PendingBookingDto.toDocument(),
        status: 'pending',
        bookingId: bookingId,
      },
      {
        new: true,
        upsert: true,
      },
    );
    return updatedBooking;
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
      .findById({ _id: bookingId })
      .populate('userId')
      .populate('hotelId');

    return bookingDetails;
  }

  async findUserBookings(userId: Types.ObjectId) {
    try {
      const userBookings = await this._completedBooking
        .find({ userId: userId })
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
}
