import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { RefreshToken } from '../schema/refresh.token.schema';
import { LoginDto } from '../dto/login.dto';
import { ILoginRepository } from '../interface/ILoginRepository.interface';
import { UserInterface } from '../../user/interface/user/IUser.interface';

@Injectable()
export class LoginRepository implements ILoginRepository {
  private readonly _logger = new Logger(LoginRepository.name);
  constructor(
    @InjectModel(User.name) private _userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private _refreshTokenModel: Model<RefreshToken>,
  ) {}

  async findUser(userData: LoginDto): Promise<User | null> {
    const user = await this._userModel.findOne({
      email: userData.email,
    });
    return user;
  }
  async findUserById(userId: Types.ObjectId): Promise<User | null> {
    return this._userModel.findById(userId).exec();
  }
  async findUserByEmail(email: string): Promise<User | null> {
    this._logger.log('my repo forgot', email);
    return this._userModel.findOne({ email: email }).exec();
  }

  async findJwtUserById(userId: Types.ObjectId): Promise<User | null> {
    const response = await this._userModel.findById(userId).exec();
    return response;
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

  async createGoogleUser(userData: UserInterface): Promise<UserInterface> {
    const newUser = new this._userModel(userData);
    return await newUser.save();
  }
}
