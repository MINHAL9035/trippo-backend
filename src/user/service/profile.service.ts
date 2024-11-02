import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EditProfileDto } from '../dto/editProfile.dto';
import { UserRepository } from '../repository/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from '../schema/wallet.schema';
import { Model, Types } from 'mongoose';
import { CompletedBooking } from '../schema/completedBookings.schema';
import { Hotel } from '../../hotel-owner/schema/HotelSchema';

@Injectable()
export class ProfileService {
  private readonly _logger = new Logger(ProfileService.name);
  constructor(
    private readonly _userRepository: UserRepository,
    @InjectModel(Wallet.name) private readonly _walletModel: Model<Wallet>,
    @InjectModel(Hotel.name) private readonly _hotelModel: Model<Hotel>,
    @InjectModel(CompletedBooking.name)
    private readonly _completedBooking: Model<CompletedBooking>,
  ) {}

  async editProfile(
    userId: string,
    editUserDetails: EditProfileDto,
    imageLocation,
  ) {
    try {
      const user = await this._userRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const updateData = {
        ...editUserDetails,
        ...(imageLocation && { image: imageLocation }),
      };
      return this._userRepository.updateUser(userId, updateData);
    } catch (error) {
      this._logger.error(`Failed to edit user ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to edit user');
    }
  }

  async createWallet(userId: Types.ObjectId): Promise<Wallet> {
    const wallet = new this._walletModel({ userId, balance: 0 });
    return wallet.save();
  }

  private getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  private calculateRefundAmount(booking) {
    const now = new Date();
    const bookingCreatedAt = new Date(booking.createdAt);
    const timeDifference = now.getTime() - bookingCreatedAt.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference <= 24) {
      return booking.totalPrice;
    }

    return booking.totalPrice * 0.5;
  }

  async addFunds(
    userId: Types.ObjectId,
    amount: number,
    description: string,
  ): Promise<Wallet> {
    let wallet = await this._walletModel.findOne({ userId });

    if (!wallet) {
      wallet = new this._walletModel({ userId, balance: 0 });
    }

    wallet.balance += amount;
    wallet.transactions.push({
      amount,
      type: 'CREDIT',
      description,
      createdAt: new Date(),
    });

    return wallet.save();
  }

  async cancelBooking(bookingId: string): Promise<{
    status: string;
    refundAmount: number;
    isFullRefund: boolean;
  }> {
    const booking = await this._completedBooking
      .findOne({ bookingId: bookingId })
      .populate('hotelId');

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const refundAmount = this.calculateRefundAmount(booking);
    const isFullRefund = refundAmount === booking.totalPrice;

    booking.status = 'cancelled';
    await booking.save();

    const hotel = await this._hotelModel.findById(booking.hotelId);
    const roomIndex = hotel.rooms.findIndex(
      (room) => room.roomId === booking.roomId,
    );

    if (roomIndex !== -1) {
      hotel.rooms[roomIndex].available += booking.rooms;
      const dates = this.getDatesInRange(booking.checkIn, booking.checkOut);
      hotel.rooms[roomIndex].availableDates.push(...dates);
      await hotel.save();
    }

    await this.addFunds(
      booking.userId,
      refundAmount,
      `Refund for booking ${bookingId} (${isFullRefund ? 'Full' : 'Partial'} refund)`,
    );

    return {
      status: 'cancelled',
      refundAmount,
      isFullRefund,
    };
  }

  async getUserWallet(userId: string) {
    try {
      return this._userRepository.findWallet(userId);
    } catch (error) {
      throw error;
    }
  }
}
