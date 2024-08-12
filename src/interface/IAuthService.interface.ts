import { Response } from 'express';
import { Types } from 'mongoose';
import { LoginDto } from 'src/auth/dto/login.dto';

export interface IAuthService {
  login(
    LoginDto: LoginDto,
    res: Response,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
  }>;
  generateUserTokens(userId: Types.ObjectId): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  userLogout(res: Response): Promise<{ message: string }>;
}
