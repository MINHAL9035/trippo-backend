import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../user/schema/user.schema';
import { Model, Types } from 'mongoose';
import { LoginDto } from '../../auth/dto/login.dto';
import { AdminRefreshToken } from '../schema/adminRefreshToken.schema';

@Injectable()
export class AdminLoginRepository {
  private readonly _logger = new Logger(AdminLoginRepository.name);
  constructor(
    @InjectModel(User.name) private _userModel: Model<User>,
    @InjectModel(AdminRefreshToken.name)
    private _adminRefreshToken: Model<AdminRefreshToken>,
  ) {}

  async find(userData: LoginDto): Promise<User | null> {
    const user = await this._userModel.findOne({
      email: userData.email,
    });
    return user;
  }

  async storeRefreshToken(token: string, userId: Types.ObjectId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    await this._adminRefreshToken.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      { upsert: true },
    );
  }

  async findRefreshToken(refreshToken: string) {
    const token = await this._adminRefreshToken
      .findOne({
        token: refreshToken,
        expiryDate: { $gte: new Date() },
      })
      .exec();
    return token;
  }

  async findUserById(userId: Types.ObjectId): Promise<User | null> {
    return this._userModel.findById(userId).exec();
  }

  async getAllUsers(): Promise<User[]> {
    this._logger.log('Fetching all users from the database');
    return this._userModel.find({ role: 'user' }).exec();
  }
}
