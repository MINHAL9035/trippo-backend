import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminLoginRepository } from '../respository/admin.repository';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/auth/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { Response } from 'express';
import {
  clearAdminTokenCookies,
  generateAdminTokens,
  setAdminTokenCookies,
} from '../utils/adminLogin.utils';
import { ConfigService } from '@nestjs/config';
import { UpdateUserStatusDto } from '../dto/updateUserStatus.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/schema/user.schema';

@Injectable()
export class AdminService {
  constructor(
    private readonly _adminRepository: AdminLoginRepository,
    private readonly _jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Logs in an admin by validating their credentials and generating tokens.
   * @param LoginDto - The login details.
   * @param res - The response object to set cookies.
   * @returns A Promise that resolves with admin details and tokens.
   */
  async loginAdmin(
    LoginDto: LoginDto,
    res: Response,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    role: string;
  }> {
    const { password } = LoginDto;
    const user = await this._adminRepository.find(LoginDto);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== 'admin') {
      throw new UnauthorizedException('Access denied: Admins only');
    }

    console.log('fdfd0');

    const tokens = await generateAdminTokens(
      user._id as Types.ObjectId,
      user.role,
      this._jwtService,
      this._adminRepository,
      this.configService,
    );
    console.log('effdf');

    setAdminTokenCookies(res, tokens);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

  async AdminRefreshTokens(
    refreshToken: string,
    res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const token = await this._adminRepository.findRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException('Refresh Token is Invalid!');
    }
    const user = await this._adminRepository.findUserById(token.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const newTokens = await generateAdminTokens(
      user._id as Types.ObjectId,
      user.role,
      this._jwtService,
      this._adminRepository,
      this.configService,
    );
    setAdminTokenCookies(res, newTokens);
    return newTokens;
  }

  async logout(res: Response): Promise<{ message: string }> {
    clearAdminTokenCookies(res);
    return { message: 'Logged out successfully' };
  }

  async getAllUsers(
    page: number,
    usersPerPage: number,
  ): Promise<{ users: User[]; totalPages: number }> {
    const skip = (page - 1) * usersPerPage;
    const totalUsers = await this.userModel.countDocuments();
    const users = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(usersPerPage)
      .exec();
    const totalPages = Math.ceil(totalUsers / usersPerPage);

    return {
      users,
      totalPages,
    };
  }

  async updateStatus(updateUserStatusDto: UpdateUserStatusDto) {
    const { userIds, action } = updateUserStatusDto;
    const isBlocked = action === 'block';

    const result = await this.userModel.updateMany(
      { _id: { $in: userIds } },
      { $set: { is_blocked: isBlocked } },
    );

    return {
      message: `${result.modifiedCount} users ${action}ed successfully`,
      modifiedCount: result.modifiedCount,
    };
  }
}
