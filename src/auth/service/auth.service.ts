import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { Response } from 'express';
import { LoginRepository } from '../repository/login.repository';
import {
  clearTokenCookies,
  generateTokens,
  setTokenCookies,
} from '../utils/loginUtils';

@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);
  constructor(
    private readonly _loginRepository: LoginRepository,
    private readonly _jwtService: JwtService,
  ) {}

  /**
   * Logs in a regular user by validating their credentials and generating tokens.
   * @param LoginDto - The login details.
   * @param res - The response object to set cookies.
   * @returns A Promise that resolves with user details and tokens.
   */
  async loginUser(
    LoginDto: LoginDto,
    res: Response,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    role: string;
    image: string;
  }> {
    const { password } = LoginDto;
    const user = await this._loginRepository.find(LoginDto);
    this._logger.log('dfkgnkad', user);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    if (user.is_blocked === true) {
      throw new UnauthorizedException('Your account is blocked');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await generateTokens(
      user._id as Types.ObjectId,
      user.role,
      this._jwtService,
      this._loginRepository,
    );

    setTokenCookies(res, tokens);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      image: user.image,
    };
  }

  /**
   * Refreshes the access token using the provided refresh token.
   * @param refreshToken - The refresh token.
   * @returns A Promise that resolves with new tokens.
   */
  async refreshTokens(
    refreshToken: string,
    res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const token = await this._loginRepository.findRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException('Refresh Token is Invalid!');
    }
    const user = await this._loginRepository.findUserById(token.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const newTokens = await generateTokens(
      user._id as Types.ObjectId,
      user.role,
      this._jwtService,
      this._loginRepository,
    );
    setTokenCookies(res, newTokens);
    return newTokens;
  }

  /**
   * Logs out the user by clearing the access token cookie.
   * @param res - The response object to set cookies.
   * @returns A Promise that resolves with a success message.
   */
  async logout(
    res: Response,
    refreshToken: string,
  ): Promise<{ message: string }> {
    await this._loginRepository.deleteRefreshToken(refreshToken);
    clearTokenCookies(res);
    return { message: 'Logged out successfully' };
  }
}
