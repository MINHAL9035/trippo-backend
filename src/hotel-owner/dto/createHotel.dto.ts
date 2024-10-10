import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  hotelName: string;

  @IsString()
  streetAddress: string;

  @IsString()
  place: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  @IsNotEmpty()
  ownerEmail: string;
}
