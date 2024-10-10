import { IsString } from 'class-validator';

export class CreatePostdto {
  @IsString()
  description: string;

  @IsString()
  place: string;
}
