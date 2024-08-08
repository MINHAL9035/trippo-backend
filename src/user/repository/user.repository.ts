import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from '../interface/user.interface';
import { User } from '../schema/user.schema';
import { UnverifiedUser } from '../schema/UnverifiedUser.schema';
import { UnverifiedUserInterface } from '../interface/unverifiedUser.interface';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserInterface>,
    @InjectModel(UnverifiedUser.name)
    private UnverifiedUserModel: Model<UnverifiedUserInterface>,
  ) {}

  async createUser(userData: UserInterface): Promise<UserInterface> {
    const newUser = new this.userModel(userData);
    return await newUser.save();
  }

  async createUnverifiedUser(
    userData: UnverifiedUserInterface,
  ): Promise<UnverifiedUserInterface> {
    const newUnverifiedUser = new this.UnverifiedUserModel(userData);
    return await newUnverifiedUser.save();
  }

  async findByEmail(email: string): Promise<UserInterface | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findUnverifiedUser(
    email: string,
  ): Promise<UnverifiedUserInterface | null> {
    return await this.UnverifiedUserModel.findOne({ email }).exec();
  }

  async deleteUnverifiedUser(email: string): Promise<void> {
    await this.UnverifiedUserModel.deleteOne({ email }).exec();
  }
}
