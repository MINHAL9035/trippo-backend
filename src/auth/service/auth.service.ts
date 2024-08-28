import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { Response } from 'express';
import { LoginRepository } from '../repository/login.repository';
import { ILogin } from '../interface/ILogin.interface';
import {
  clearTokenCookies,
  generateTokens,
  setTokenCookies,
} from '../utils/loginUtils';
import { IAuthService } from '../interface/ILoginService.interface';
import { OAuth2Client } from 'google-auth-library';
import { GoogleAuthDto } from '../dto/googleAuth.dto';
import fetchGoggleUserDetails from '../utils/fetchGoogleUserDetails';
import { UserInterface } from 'src/user/interface/user/IUser.interface';

@Injectable()
export class AuthService implements IAuthService {
  private readonly _logger = new Logger(AuthService.name);
  private cleint: OAuth2Client;
  constructor(
    private readonly _loginRepository: LoginRepository,
    private readonly _jwtService: JwtService,
  ) {
    this.cleint = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Logs in a regular user by validating their credentials and generating tokens.
   * @param LoginDto - The login details.
   * @param res - The response object to set cookies.
   * @returns A Promise that resolves with user details and tokens.
   */
  async loginUser(LoginDto: LoginDto, res: Response): Promise<ILogin> {
    const { password } = LoginDto;
    const user = await this._loginRepository.find(LoginDto);
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
    };
  }

  async googleLogin(GoogleAuthDto: GoogleAuthDto, res: Response): Promise<any> {
    try {
      const userDetails = await fetchGoggleUserDetails(GoogleAuthDto);
      console.log('sf', userDetails);

      const existingUser = await this._loginRepository.findUserByEmail(
        userDetails.email,
      );

      let user;
      if (!existingUser) {
        const newUser: UserInterface = {
          firstName: userDetails.given_name,
          lastName: userDetails.family_name,
          email: userDetails.email,
          verified: userDetails.verified_email,
          is_blocked: false,
          image: userDetails.picture,
          role: 'user',
        };
        user = await this._loginRepository.createGoogleUser(newUser);
      } else {
        user = existingUser;
      }

      const tokens = await generateTokens(
        user._id as Types.ObjectId,
        user.role,
        this._jwtService,
        this._loginRepository,
      );

      setTokenCookies(res, tokens);

      return {
        email: user.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userId: user._id.toString(),
      };
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred during Google login');
    }
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
    try {
      this._logger.log(`Deleting refresh token: ${refreshToken}`);
      await this._loginRepository.deleteRefreshToken(refreshToken);
      clearTokenCookies(res);
      this._logger.log('Cookies cleared successfully');
      return { message: 'Logged out successfully' };
    } catch (error) {
      this._logger.error('Error during logout process', error.stack);
      throw error;
    }
  }
}
