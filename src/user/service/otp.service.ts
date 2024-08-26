import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OtpRepository } from '../repository/Otp.repository';
import * as crypto from 'crypto';
import { OTP } from '../interface/otp/IOtp.interface';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { IOtpService } from '../interface/otp/IOtpService.interface';

@Injectable()
export class OtpService implements IOtpService {
  private readonly _logger = new Logger(OtpService.name);
  constructor(
    private readonly _otpRepository: OtpRepository,
    private readonly _mailerService: MailerService,
    private readonly _configService: ConfigService,
  ) {}

  /**
   * Generates a 6-digit OTP.
   * @returns - A random 6-digit OTP.
   */
  private generateOtp(): number {
    return crypto.randomInt(100000, 999999);
  }

  /**
   * Creates a new OTP for the given email, deleting any previous OTPs.
   * @param email - The user's email address.
   * @returns - The created OTP record.
   */
  async createOtp(email: string): Promise<OTP> {
    await this._otpRepository.deleteByEmail(email);
    const otp = this.generateOtp();
    this._logger.log('generated otp', otp);
    return this._otpRepository.saveOtp(email, otp);
  }

  /**
   * Sends the OTP to the user's email with a formatted HTML email.
   * @param email - The user's email address.
   * @param otp - The OTP to send.
   */
  async sendOtpEmail(email: string, otp: number): Promise<void> {
    const from = this._configService.get<string>('EMAIL_From');
    const websiteName = 'Trippo';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; background-color: #f4f7f9; margin: 0; padding: 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="padding: 40px 0; background-color: #003366;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0; letter-spacing: 2px;">${websiteName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #003366; font-size: 24px; margin-bottom: 20px; text-align: center;">Verification Code</h2>
              <p style="color: #333333; font-size: 16px; line-height: 24px; text-align: center;">
                To complete your registration, please use the following One-Time Password (OTP):
              </p>
              <div style="background-color: #e6f2ff; border: 2px solid #003366; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <span style="font-size: 36px; color: #003366; letter-spacing: 8px; font-weight: bold;">${otp}</span>
              </div>
              <p style="color: #666666; font-size: 14px; margin-top: 20px; text-align: center;">
                This OTP will expire in 2 minutes.
              </p>
              <p style="color: #666666; font-size: 14px; margin-top: 20px; text-align: center;">
                If you didn't request this code, please disregard this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #003366; color: #ffffff; text-align: center; padding: 20px; font-size: 14px;">
              <p style="margin: 0;">&copy; 2024 ${websiteName}. All rights reserved.</p>
            
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await this._mailerService.sendMail({
      to: email,
      from: from,
      subject: `Your Verification Code for ${websiteName}`,
      text: `Your verification code for ${websiteName} is: ${otp}. It will expire in 2 minutes.`,
      html: htmlContent,
    });
  }

  /**
   * Creates and sends a new OTP to the given email.
   * @param email - The user's email address.
   */
  async sendOtp(email: string): Promise<void> {
    const otpRecord = await this.createOtp(email);
    await this.sendOtpEmail(email, otpRecord.otp);
  }

  /**
   * Verifies the provided OTP for the given email.
   * @param email - The user's email address.
   * @param otp - The OTP to verify.
   * @throws NotFoundException if no OTP is found for the email.
   * @throws BadRequestException if the OTP is invalid or expired.
   */
  async verifyOtp(email: string, otp: number): Promise<void> {
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
  }
}
