import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AdminLoginRepository } from '../respository/admin.repository';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

export async function generateAdminTokens(
  userId: Types.ObjectId,
  role: string,
  jwtService: JwtService,
  adminRepository: AdminLoginRepository,
  configService: ConfigService,
): Promise<{ accessToken: string; refreshToken: string }> {
  const secret = configService.get<string>('JWT_SECRET');
  console.log('secret', secret);

  const accessToken = jwtService.sign({ userId, role }, { secret });
  console.log('adminToken', accessToken);
  const refreshToken = uuidv4();
  await adminRepository.storeRefreshToken(refreshToken, userId);
  return {
    accessToken,
    refreshToken,
  };
}

export function setAdminTokenCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  res.cookie('adminAccessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie('adminRefreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAdminTokenCookies(res: Response) {
  res.cookie('adminAccessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });

  res.cookie('adminRefreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });
}
