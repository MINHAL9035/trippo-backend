import { Body, Controller, Logger, Patch, Post } from '@nestjs/common';
import { ForgotService } from '../service/forgot.service';
import { ForgotOtpDto } from '../dto/forgotOtp.dto';

@Controller('auth')
export class ForgotController {
  private readonly _logger = new Logger(ForgotController.name);
  constructor(private readonly _forgotService: ForgotService) {}

  /**
   * Handles the request to send a forgotten password OTP to the user's email.
   * @param email - The email of the user requesting the OTP.
   * @returns Response indicating success or failure of the OTP sending.
   */
  @Post('forgotOtp')
  async forgotOtp(@Body('email') email: string) {
    const response = await this._forgotService.forgotOtp(email);
    return response;
  }

  /**
   * Verifies the OTP sent to the user's email for password recovery.
   * @param ForgotOtpDto - Data Transfer Object containing the email and OTP.
   * @returns Response indicating if the OTP is valid or not.
   */
  @Post('verifyForgotOtp')
  async verifyOtp(@Body() ForgotOtpDto: ForgotOtpDto) {
    const response = await this._forgotService.verifyOtp(
      ForgotOtpDto.email,
      ForgotOtpDto.otp,
    );
    return response;
  }

  /**
   * Changes the user's password after verifying their identity.
   * @param param0 - Object containing the user's email and new password.
   * @returns Response indicating if the password was successfully changed.
   */
  @Patch('changePassword')
  async changePassword(
    @Body()
    { email, password }: { email: string; password: string },
  ) {
    const response = await this._forgotService.changePassword(email, password);
    return response;
  }
}
