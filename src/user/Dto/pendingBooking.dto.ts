// import { IsDateString, IsMongoId, IsString } from 'class-validator';
// import { Types } from 'mongoose';

// export class PendingBookingDto {
//   @IsDateString()
//   checkIn: string;

//   @IsDateString()
//   checkOut: string;

//   @IsMongoId()
//   hotelId: string;

//   @IsString()
//   roomId: string;

//   @IsMongoId()
//   userId: string;
//   toDocument(): Record<string, any> {
//     return {
//       userId: new Types.ObjectId(this.userId),
//       hotelId: new Types.ObjectId(this.hotelId),
//       roomId: this.roomId,
//       checkIn: new Date(this.checkIn),
//       checkOut: new Date(this.checkOut),
//     };
//   }
// }
import { IsString, IsUUID, IsDateString, IsInt, Min } from 'class-validator';

export class PendingBookingDto {
  @IsString()
  hotelId: string;

  @IsUUID()
  roomId: string;

  @IsString()
  userId: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsInt()
  @Min(0)
  roomRate: number;

  @IsInt()
  @Min(0)
  rooms: number;
}
