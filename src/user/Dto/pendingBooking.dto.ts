import {
  IsString,
  IsDateString,
  IsInt,
  IsArray,
  IsMongoId,
  Min,
} from 'class-validator';

export class PendingBookingDto {
  @IsString()
  destination: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsInt()
  @Min(1)
  rooms: number;

  @IsInt()
  @Min(1)
  adults: number;

  @IsArray()
  children: number[];

  @IsMongoId()
  hotelId: string;

  @IsMongoId()
  userId: string;
}
