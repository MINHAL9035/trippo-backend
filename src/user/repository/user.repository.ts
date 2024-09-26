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

  async findUnverifiedUser(
    email: string,
  ): Promise<UnverifiedUserInterface | null> {
    return await this._UnverifiedUserModel.findOne({ email }).exec();
  }

  async deleteUnverifiedUser(email: string): Promise<void> {
    await this._UnverifiedUserModel.deleteOne({ email }).exec();
  }

  async findHotels(destination: string) {
    return await this._hotel
      .find({ place: destination })
      .sort({ createdAt: -1 });
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
    const { userId, hotelId } = PendingBookingDto;
    const filter = { userId, hotelId };
    const bookingId = this.generateBookingId();
    const updatedBooking = await this._pendingBooking.findOneAndUpdate(
      filter,
      { ...PendingBookingDto, status: 'pending', bookingId: bookingId },
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
}
