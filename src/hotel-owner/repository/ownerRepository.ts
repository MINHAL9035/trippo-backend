import { Injectable } from '@nestjs/common';
import { OwnerInterface } from '../interface/IOwner.interface';
import { InjectModel } from '@nestjs/mongoose';
import { UnverifiedOwner } from '../schema/UnverifiedOwnerSchema';
import { Model } from 'mongoose';
import { UpdateOwnerDto } from '../dto/createOwner.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/auth/dto/login.dto';
import { Owner } from '../schema/owner.schema';
import { Types } from 'mongoose';
import { OwnerRefreshToken } from '../schema/ownerRefreshToken.schema';
import { Hotel } from '../schema/HotelSchema';

@Injectable()
export class OwnerRepository {
  constructor(
    @InjectModel(UnverifiedOwner.name)
    private _ownerModel: Model<UnverifiedOwner>,
    @InjectModel(Owner.name)
    private _verifiedOwner: Model<Owner>,
    @InjectModel(OwnerRefreshToken.name)
    private _ownerRefreshToken: Model<OwnerRefreshToken>,
    @InjectModel(Hotel.name)
    private _hotelModel: Model<Hotel>,
  ) {}

  async createOwner(email: string): Promise<OwnerInterface> {
    const newOwner = new this._ownerModel({ email });
    return await newOwner.save();
  }

  async findByEmail(email: string): Promise<OwnerInterface | null> {
    return await this._ownerModel.findOne({ email }).exec();
  }

  async updateOwner(
    updateOwnerDto: UpdateOwnerDto,
  ): Promise<OwnerInterface | null> {
    const { email, password, ...updateData } = updateOwnerDto;

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedOwner = await this._ownerModel
      .findOneAndUpdate(
        { email },
        {
          $set: {
            ...updateData,
            ...(hashedPassword && { password: hashedPassword }),
          },
        },
        { new: true, runValidators: true },
      )
      .exec();

    return updatedOwner;
  }

  async findOwner(ownerDetails: LoginDto): Promise<Owner | null> {
    const user = await this._verifiedOwner.findOne({
      email: ownerDetails.email,
    });
    return user;
  }

  async storeRefreshToken(token: string, ownerId: Types.ObjectId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    await this._ownerRefreshToken.updateOne(
      { ownerId },
      { $set: { expiryDate, token } },
      { upsert: true },
    );
  }

  async findJwtOwnerById(
    ownerId: Types.ObjectId,
  ): Promise<OwnerInterface | null> {
    const response = await this._verifiedOwner.findOne({ _id: ownerId }).exec();
    return response;
  }

  async findHotels(ownerId: Types.ObjectId) {
    const hotels = await this._hotelModel
      .find({ ownerId: ownerId })
      .sort({ createdAt: -1 });
    return hotels;
  }
}
