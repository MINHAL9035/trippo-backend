import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from '../schema/Otp.schema';
import { Model } from 'mongoose';
import { OTP } from '../interface/Otp.interface';

@Injectable()
export class OtpRepository {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OTP>) {}
  async saveOtp(email: string, otp: number): Promise<OTP> {
    const newOtp = new this.otpModel({
      email,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60000),
    });
    return newOtp.save();
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.otpModel.deleteMany({ email }).exec();
  }

  async findByEmail(email: string): Promise<OTP | null> {
    console.log('rep email', email);
    const ots = await this.otpModel.findOne({ email }).exec();
    console.log('shdjs', ots);

    return ots;
  }
}
