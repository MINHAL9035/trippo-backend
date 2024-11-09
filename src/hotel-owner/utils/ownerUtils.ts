import { JwtService } from '@nestjs/jwt';
import { OwnerRepository } from '../repository/ownerRepository';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';

export async function generateOwnerToken(
  ownerId: Types.ObjectId,
  jwtService: JwtService,
  OwnerRepository: OwnerRepository,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = jwtService.sign(
    { ownerId },
    { secret: process.env.JWT_SECRET },
  );
  const refreshToken = uuidv4();
  await OwnerRepository.storeRefreshToken(refreshToken, ownerId);
  return {
    accessToken,
    refreshToken,
  };
}

export function setOwnerTokenCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('ownerAccessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
  res.cookie('ownerRefreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearOwnerTokenCookies(res: Response) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('ownerAccessToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    expires: new Date(0),
  });

  res.cookie('ownerRefreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    expires: new Date(0),
  });
}
