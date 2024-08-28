import { IsInt, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  access_token: string;

  @IsString()
  token_type: string;

  @IsInt()
  expires_in: string;
}
