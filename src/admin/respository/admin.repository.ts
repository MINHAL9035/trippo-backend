import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/schema/user.schema';
import { Model, Types } from 'mongoose';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RefreshToken } from 'src/auth/schema/refresh.token.schema';
import { IAuthRepository } from '../../interface/IAuthRepository.interface';

@Injectable()
export class AdminLoginRepository implements IAuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
  ) {}

  async findUser(adminData: LoginDto): Promise<User | null> {
    const admin = await this.userModel.findOne({
      email: adminData.email,
      isAdmin: true,
    });
    return admin;
  }
  async storeRefreshToken(token: string, userId: Types.ObjectId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      { upsert: true },
    );
  }

  async findRefreshToken(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    }).exec();
    return token;
  }
}
