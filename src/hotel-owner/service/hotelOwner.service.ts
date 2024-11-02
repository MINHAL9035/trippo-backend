import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OTP } from '../../user/interface/otp/IOtp.interface';
import { OtpRepository } from '../../user/repository/Otp.repository';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { OwnerRepository } from '../repository/ownerRepository';
import { OwnerInterface } from '../interface/IOwner.interface';
import { UpdateOwnerDto } from '../dto/createOwner.dto';
import { LoginDto } from '../../auth/dto/login.dto';
import { IOwnerLogin } from '../../auth/interface/ILogin.interface';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  clearOwnerTokenCookies,
  generateOwnerToken,
  setOwnerTokenCookies,
} from '../utils/ownerUtils';
import { Response } from 'express';

@Injectable()
export class HotelOwnerService {
  private readonly _logger = new Logger(HotelOwnerService.name);
  constructor(
    private readonly _otpRepository: OtpRepository,
    private readonly _mailerService: MailerService,
    private readonly _configService: ConfigService,
    private readonly _ownerRepository: OwnerRepository,
    private readonly _jwtService: JwtService,
  ) {}

  private generateOtp(): number {
    return crypto.randomInt(100000, 999999);
  }

  async createOtp(email: string): Promise<OTP> {
    await this._otpRepository.deleteByEmail(email);
    const otp = this.generateOtp();
    this._logger.log('generated otp', otp);
    return this._otpRepository.saveOtp(email, otp);
  }

  async sendOtpEmail(email: string, otp: number): Promise<void> {
    const from = this._configService.get<string>('EMAIL_From');
    const websiteName = 'Trippo';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code for Hotel Owner Signup</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; margin: 0; padding: 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="padding: 40px 0; background-color: #4a90e2; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0;">${websiteName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333333; font-size: 22px; margin-bottom: 20px; text-align: center;">Verify Your Email to Get Started</h2>
              <p style="color: #666666; font-size: 16px; line-height: 24px; text-align: center;">
                Thank you for choosing to list your hotel on ${websiteName}. To complete your signup and start creating your hotel profile, please use this verification code:
              </p>
              <div style="background-color: #f0f7ff; border: 2px dashed #4a90e2; border-radius: 8px; padding: 15px; margin: 25px 0; text-align: center;">
                <span style="font-size: 32px; color: #4a90e2; letter-spacing: 5px; font-weight: bold;">${otp}</span>
              </div>
              <p style="color: #666666; font-size: 14px; margin-top: 20px; text-align: center;">
                Enter this code on the signup page to verify your email and continue setting up your hotel listing.
              </p>
              <p style="color: #666666; font-size: 14px; margin-top: 20px; text-align: center;">
                This code will expire in 2 minutes. If you didn't request this code, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f0f7ff; color: #666666; text-align: center; padding: 20px; font-size: 14px; border-radius: 0 0 8px 8px;">
              <p style="margin: 0;">© 2024 ${websiteName}. All rights reserved.</p>
              <p style="margin: 10px 0 0;">Connecting travelers with great hotels</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await this._mailerService.sendMail({
      to: email,
      from: from,
      subject: `Verify Your Email for ${websiteName} Hotel Signup`,
      text: `Your verification code for ${websiteName} hotel owner signup is: ${otp}. Enter this code on the signup page to verify your email and continue setting up your hotel listing. The code will expire in 2 minutes.`,
      html: htmlContent,
    });
  }

  async sendOtp(email: string): Promise<void> {
    const otpRecord = await this.createOtp(email);
    await this.sendOtpEmail(email, otpRecord.otp);
  }

  async verifyOtp(email: string, otp: number): Promise<void> {
    try {
      const otpRecord = await this._otpRepository.findByEmail(email);
      if (!otpRecord) {
        throw new NotFoundException('OTP not found for this email');
      }

      if (otpRecord.otp !== otp) {
        throw new BadRequestException('Invalid OTP');
      }

      if (otpRecord.expiresAt < new Date()) {
        throw new BadRequestException(
          'OTP has expired , please request for new one',
        );
      }
      await this._otpRepository.deleteByEmail(email);
      await this._ownerRepository.createOwner(email);
    } catch (error) {
      console.log(error);
    }
  }

  async getUserDetails(email: string): Promise<OwnerInterface> {
    try {
      const owner = await this._ownerRepository.findByEmail(email);
      if (!owner) {
        throw new NotFoundException('owner not found');
      }
      return owner;
    } catch (error) {
      this._logger.error(
        `Failed to find user: ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateOwner(updateOwnerDto: UpdateOwnerDto) {
    const updatedOwner =
      await this._ownerRepository.updateOwner(updateOwnerDto);
    if (!updatedOwner) {
      throw new NotFoundException(
        `Owner with email ${updateOwnerDto.email} not found`,
      );
    }
    return updatedOwner;
  }

  async loginOwner(LoginDto: LoginDto, res: Response): Promise<IOwnerLogin> {
    try {
      const { password } = LoginDto;
      const owner = await this._ownerRepository.findOwner(LoginDto);
      if (!owner) {
        throw new UnauthorizedException('You are not a owner, please sign up');
      }
      const passwordMatch = await bcrypt.compare(password, owner.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Incorrect Password');
      }

      const tokens = await generateOwnerToken(
        owner._id as Types.ObjectId,
        this._jwtService,
        this._ownerRepository,
      );
      setOwnerTokenCookies(res, tokens);
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        ownerId: owner._id.toString(),
        email: owner.email,
      };
    } catch (error) {
      this._logger.error('Error in loginUser method', error);
      throw error;
    }
  }

  async logout(res: Response): Promise<{ message: string }> {
    clearOwnerTokenCookies(res);
    return { message: 'Logged out successfully' };
  }

  async getOwnerHotels(ownerId: Types.ObjectId) {
    try {
      const hotels = await this._ownerRepository.findHotels(ownerId);
      return hotels;
    } catch (error) {
      this._logger.error(error);
      throw new error();
    }
  }
}
