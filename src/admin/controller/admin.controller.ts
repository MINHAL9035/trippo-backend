import { Body, Controller, Post, Res } from '@nestjs/common';
import { AdminService } from '../service/admin.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { Response } from 'express';
import { RefreshTokenDto } from 'src/auth/dto/refreshToken.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly AdminService: AdminService) {}

  /**
   * Handles admin login requests.
   * @param LoginDto - Contains admin login details (email and password).
   * @param res - Express response object to set cookies.
   * @returns - Returns login response including tokens and admin details.
   */
  @Post('login')
  async adminLogin(
    @Body() LoginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.AdminService.adminLogin(LoginDto, res);
  }

  /**
   * Handles token refresh requests.
   * @param RefreshTokenDto - Contains the refresh token.
   * @returns - Returns new access and refresh tokens.
   */
  @Post('refresh')
  async refreshToken(@Body() RefreshTokenDto: RefreshTokenDto) {
    return this.AdminService.refreshTokens(RefreshTokenDto.refreshToken);
  }

  /**
   * Handles admin logout requests.
   * @param res - Express response object to clear cookies.
   * @returns - Returns a message indicating successful logout.
   */
  @Post('logout')
  async userLogout(@Res({ passthrough: true }) res: Response) {
    return this.AdminService.adminLogout(res);
  }
}
