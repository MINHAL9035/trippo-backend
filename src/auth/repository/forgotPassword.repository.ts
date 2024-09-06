import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { IForgotRepository } from '../interface/IForgotRepository.interface';

@Injectable()
export class ForgotRepository implements IForgotRepository {
  constructor(@InjectModel(User.name) private _userModel: Model<User>) {}

  async findUser(email: string): Promise<User | null> {
    const user = await this._userModel.findOne({ email: email }).exec();
    return user;
  }
  async findGoogleUser(email: string): Promise<User | null> {
    const user = await this._userModel
      .findOne({ email: email, isGoogle: true })
      .exec();
    return user;
  }

  async updateUser(
    email: string,
    hashedPassword: string,
  ): Promise<User | null> {
    return await this._userModel
      .findOneAndUpdate({ email }, { password: hashedPassword }, { new: true })
      .exec();
  }
}
