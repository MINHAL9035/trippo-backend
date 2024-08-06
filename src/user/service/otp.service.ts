import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpRepository } from '../repository/Otp.repository';
import * as crypto from 'crypto';
import { OTP } from '../interface/Otp.interface';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class OtpService {
  constructor(
    private readonly OtpRepository: OtpRepository,
    private readonly MailerService: MailerService,
    private readonly ConfigService: ConfigService,
  ) {}

  private generateOtp(): number {
    return crypto.randomInt(100000, 999999);
  }

  async createOtp(email: string): Promise<OTP> {
    await this.OtpRepository.deleteByEmail(email);
    const otp = this.generateOtp();
    console.log(otp);
    return this.OtpRepository.saveOtp(email, otp);
  }

  async sendOtpEmail(email: string, otp: number): Promise<void> {
    const from = this.ConfigService.get<string>('EMAIL_From');
    await this.MailerService.sendMail({
      to: email,
      from: from,
      subject: 'Your OTP for Registration',
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      html: `<b>Your OTP is: ${otp}</b><br>It will expire in 2 minutes.`,
    });
  }

  async sendOtp(email: string): Promise<void> {
    const otpRecord = await this.createOtp(email);
    await this.sendOtpEmail(email, otpRecord.otp);
  }

  async verifyOtp(email: string, otp: number): Promise<void> {
    console.log('my service', otp);
    console.log('my service', email);

    const otpRecord = await this.OtpRepository.findByEmail(email);
    console.log('otpRecord', otpRecord);

    if (!otpRecord) {
      throw new BadRequestException('OTP not found');
    }
    console.log(otp);
    if (otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }
    await this.OtpRepository.deleteByEmail(email);
  }
}
