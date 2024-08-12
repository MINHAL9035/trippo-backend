import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from '../schema/Otp.schema';
import { Model } from 'mongoose';
import { OTP } from '../interface/otp/IOtp.interface';
import { IOtpRepository } from '../interface/otp/IOtpRepository';

@Injectable()
export class OtpRepository implements IOtpRepository {
  constructor(@InjectModel(Otp.name) private _otpModel: Model<Otp>) {}
  async saveOtp(email: string, otp: number): Promise<OTP> {
    const newOtp = new this._otpModel({
      email,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1 * 60000),
    });
    return newOtp.save();
  }

  async deleteByEmail(email: string): Promise<void> {
    await this._otpModel.deleteMany({ email }).exec();
  }

  async findByEmail(email: string): Promise<OTP | null> {
    const ots = await this._otpModel.findOne({ email }).exec();
    return ots;
  }
}
