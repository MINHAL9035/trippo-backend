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
