import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { LoginRepository } from '../repository/login.repository';
import { IAuthService } from 'src/interface/IAuthService.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly _loginRepository: LoginRepository,
    private readonly _jwtService: JwtService,
  ) {}

  /**
   * Logs in a user by validating their credentials and generating tokens.
   * @param LoginDto - The login details.
   * @param res - The response object to set cookies.
   * @returns A Promise that resolves with user details and tokens.
   */
  async login(
    LoginDto: LoginDto,
    res: Response,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
  }> {
    const { password } = LoginDto;
    const user = await this._loginRepository.findUser(LoginDto);

    if (!user) {
      throw new UnauthorizedException('Wrong details');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong password');
    }

    const tokens = await this.generateUserTokens(user._id as Types.ObjectId);
    console.log(tokens);

    res.cookie('usersAccessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user._id.toString(),
      email: user.email,
    };
  }

  /**
   * Generates new access and refresh tokens for the user.
   * @param userId - The user ID.
   * @returns A Promise that resolves with the new tokens.
   */
  async generateUserTokens(
    userId: Types.ObjectId,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this._jwtService.sign({ userId });
    const refreshToken = uuidv4();
    await this._loginRepository.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refreshes the access token using the provided refresh token.
   * @param refreshToken - The refresh token.
   * @returns A Promise that resolves with new tokens.
   */
  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const token = await this._loginRepository.findRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException('Refresh Token is Invalid!');
    }
    return this.generateUserTokens(token.userId);
  }

  /**
   * Logs out the user by clearing the access token cookie.
   * @param res - The response object to set cookies.
   * @returns A Promise that resolves with a success message.
   */
  async userLogout(res: Response): Promise<{ message: string }> {
    res.cookie('usersAccessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
    });
    return { message: 'Logged out successfully' };
  }
}
