import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ForgotRepository } from '../repository/forgotPassword.repository';
import { OtpService } from '../../user/service/otp.service';
import { OtpRepository } from '../../user/repository/Otp.repository';
import { LoginRepository } from '../repository/login.repository';
import * as bcrypt from 'bcrypt';
import { IForgotService } from '../interface/IForgotService.interface';

@Injectable()
export class ForgotService implements IForgotService {
  private readonly _logger = new Logger(ForgotService.name);
  constructor(
    private readonly _forgotRepository: ForgotRepository,
    private readonly _otpService: OtpService,
    private readonly _otpRepository: OtpRepository,
    private readonly _loginRepository: LoginRepository,
  ) {}

  /**
   * Sends an OTP to the user's email if they exist and are not a Google user.
   * @param email - The user's email address.
   */
  async forgotOtp(email: string): Promise<void> {
    try {
      const user = await this._forgotRepository.findUser(email);
      if (!user) {
        throw new UnauthorizedException(
          'Not a user please complete the signup',
        );
      }

      const googleUser = await this._forgotRepository.findGoogleUser(email);
      if (googleUser) {
        throw new UnauthorizedException('You can use the google login');
      }

      await this._otpService.sendOtp(email);
    } catch (error) {
      this._logger.error('Error in loginUser method', error);
      throw error;
    }
  }

  /**
   * Verifies the provided OTP for the user's email.
   * @param email - The user's email address.
   * @param otp - The OTP to verify.
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

  /**
   * Changes the user's password if the new password is different from the old one.
   * @param email - The user's email address.
   * @param newPassword - The new password to set.
   * @returns A success message if the password is changed.
   */
  async changePassword(email: string, newPassword: string): Promise<string> {
    try {
      const user = await this._loginRepository.findUserByEmail(email);
      this._logger.log('skfk', user.password);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException('Please enter a new password');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await this._forgotRepository.updateUser(email, hashedPassword);
      return 'Password changed successfully';
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }
}
