import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from '../interface/user/IUser.interface';
import { User } from '../schema/user.schema';
import { UnverifiedUser } from '../schema/UnverifiedUser.schema';
import { UnverifiedUserInterface } from '../interface/user/IUnverifiedUser.interface';
import { IUserRepository } from '../interface/user/IuserRepository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name)
    private _userModel: Model<User>,
    @InjectModel(UnverifiedUser.name)
    private _UnverifiedUserModel: Model<UnverifiedUser>,
  ) {}

  async createUser(userData: UserInterface): Promise<UserInterface> {
    const newUser = new this._userModel(userData);
    return await newUser.save();
  }

  async createUnverifiedUser(
    userData: UnverifiedUserInterface,
  ): Promise<UnverifiedUserInterface> {
    const newUnverifiedUser = new this._UnverifiedUserModel(userData);
    return await newUnverifiedUser.save();
  }

  async findByEmail(email: string): Promise<UserInterface | null> {
    return await this._userModel.findOne({ email }).exec();
  }

  async findUnverifiedUser(
    email: string,
  ): Promise<UnverifiedUserInterface | null> {
    return await this._UnverifiedUserModel.findOne({ email }).exec();
  }

  async deleteUnverifiedUser(email: string): Promise<void> {
    await this._UnverifiedUserModel.deleteOne({ email }).exec();
  }
}
