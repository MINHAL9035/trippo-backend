import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoginRepository } from '../repository/login.repository';

export async function generateTokens(
  userId: Types.ObjectId,
  role: string,
  jwtService: JwtService,
  loginRepository: LoginRepository,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = jwtService.sign({ userId, role });
  const refreshToken = uuidv4();
  await loginRepository.storeRefreshToken(refreshToken, userId);
  return {
    accessToken,
    refreshToken,
  };
}

export function setTokenCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('userAccessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie('userRefreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearTokenCookies(res: Response) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('userAccessToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    expires: new Date(0),
  });

  res.cookie('userRefreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    expires: new Date(0),
  });
}
