import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class TripDto {
  @IsString()
  tripName: string;

  @IsString()
  destination: string;

  @IsOptional()
  @IsNumber()
  lengthOfStay?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
