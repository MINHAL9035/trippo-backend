import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { RefreshToken } from '../schema/refresh.token.schema';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LoginRepository {
  private readonly _logger = new Logger(LoginRepository.name);
  constructor(
    @InjectModel(User.name) private _userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private _refreshTokenModel: Model<RefreshToken>,
  ) {}

  async find(userData: LoginDto): Promise<User | null> {
    const user = await this._userModel.findOne({
      email: userData.email,
    });
    this._logger.log('dkjanfhkads', user);
    return user;
  }

  async findUserById(userId: Types.ObjectId): Promise<User | null> {
    return this._userModel.findById(userId).exec();
  }

  async storeRefreshToken(token: string, userId: Types.ObjectId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    await this._refreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      { upsert: true },
    );
  }

  async findRefreshToken(refreshToken: string) {
    const token = await this._refreshTokenModel
      .findOne({
        token: refreshToken,
        expiryDate: { $gte: new Date() },
      })
      .exec();
    return token;
  }

  async deleteRefreshToken(refreshToken: string): Promise<void> {
    await this._refreshTokenModel.deleteOne({ token: refreshToken }).exec();
  }
}
