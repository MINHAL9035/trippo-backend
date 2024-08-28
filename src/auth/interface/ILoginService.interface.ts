import { Response } from 'express';
import { LoginDto } from '../dto/login.dto';
import { ILogin } from './ILogin.interface';

export interface IAuthService {
  loginUser(LoginDto: LoginDto, res: Response): Promise<ILogin>;
  refreshTokens(
    refreshToken: string,
    res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  logout(res: Response, refreshToken: string): Promise<{ message: string }>;
}
