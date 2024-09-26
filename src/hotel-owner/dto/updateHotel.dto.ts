import { IsString } from 'class-validator';

export class UpdateHotelDto {
  @IsString()
  hotelName: string;

  @IsString()
  roomType: string;

  @IsString()
  numberOfRooms: string;

  @IsString()
  streetAddress: string;

  @IsString()
  place: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  postalCode: string;
}
