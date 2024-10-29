import { IsString } from 'class-validator';

export class SubmitDetailsDto {
  @IsString()
  ownerId: string;

  @IsString()
  hotelId: string;
}
