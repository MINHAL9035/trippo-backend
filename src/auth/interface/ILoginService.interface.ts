import { Response } from 'express';
import { LoginDto } from '../dto/login.dto';
import { ILogin } from './ILogin.interface';
import { GoogleAuthDto } from '../dto/googleAuth.dto';

export interface IAuthService {
  loginUser(LoginDto: LoginDto, res: Response): Promise<ILogin>;
  googleLogin(GoogleAuthDto: GoogleAuthDto, res: Response): Promise<ILogin>;
  refreshTokens(
    refreshToken: string,
    res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  logout(res: Response, refreshToken: string): Promise<{ message: string }>;
}
