import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginRepository } from '../respository/admin.repository';
import { LoginDto } from 'src/auth/Dto/login.dto';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IAuthService } from 'src/interface/IAuthService.interface';

@Injectable()
export class AdminService implements IAuthService {
  constructor(
    private readonly JwtService: JwtService,
    private readonly AdminLoginRepository: AdminLoginRepository,
  ) {}

  /**
   * Handles admin login, validates credentials, and sets authentication cookies.
   * @param LoginDto - DTO containing login details (email and password).
   * @param res - Express response object to set cookies.
   * @returns - Object containing accessToken, refreshToken, userId, and email.
   */
  async login(LoginDto: LoginDto, res: Response) {
    const { password } = LoginDto;
    const admin = await this.AdminLoginRepository.findUser(LoginDto);
    if (!admin) {
      throw new UnauthorizedException('wrong admin credentials ');
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong password');
    }
    const tokens = await this.generateUserTokens(admin._id as Types.ObjectId);
    res.cookie('adminAccessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return {
      ...tokens,
      userId: admin._id.toString(),
      email: admin.email,
    };
  }

  /**
   * Generates access and refresh tokens for an admin.
   * @param userId - Admin's unique identifier.
   * @returns - Object containing accessToken and refreshToken.
   */
  async generateUserTokens(userId: Types.ObjectId) {
    const accessToken = this.JwtService.sign({ userId });
    const refreshToken = uuidv4();
    await this.AdminLoginRepository.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refreshes tokens using a valid refresh token.
   * @param refreshToken - The refresh token to validate.
   * @returns - Object containing new accessToken and refreshToken.
   */
  async refreshTokens(refreshToken: string) {
    const token =
      await this.AdminLoginRepository.findRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException('Refresh Token is Invalid!');
    }
    return this.generateUserTokens(token.userId);
  }

  /**
   * Logs out an admin by clearing the authentication cookie.
   * @param res - Express response object to clear cookies.
   * @returns - Object with a message indicating successful logout.
   */
  async userLogout(res: Response) {
    res.cookie('adminAccessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
    });
    return { message: 'Logged out successfully' };
  }
}
