import { IsDateString, IsString } from 'class-validator';

export class TripDto {
  @IsString()
  tripName: string;

  @IsString()
  destination: string;

  @IsDateString()
  tripStartDate: string;

  @IsDateString()
  tripEndDate: string;
}
