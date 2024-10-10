import { IsDateString, IsMongoId, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class PendingBookingDto {
  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsMongoId()
  hotelId: string;

  @IsString()
  roomId: string;

  @IsMongoId()
  userId: string;
  toDocument(): Record<string, any> {
    return {
      userId: new Types.ObjectId(this.userId),
      hotelId: new Types.ObjectId(this.hotelId),
      roomId: this.roomId,
      checkIn: new Date(this.checkIn),
      checkOut: new Date(this.checkOut),
    };
  }
}
