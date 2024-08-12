import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { RefreshToken } from '../schema/refresh.token.schema';
import { LoginDto } from '../dto/login.dto';
import { IAuthRepository } from '../../interface/IAuthRepository.interface';

@Injectable()
export class LoginRepository implements IAuthRepository {
  constructor(
    @InjectModel(User.name) private _userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private _refreshTokenModel: Model<RefreshToken>,
  ) {}

  async findUser(userData: LoginDto): Promise<User | null> {
    const user = await this._userModel.findOne({ email: userData.email });
    return user;
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
}
