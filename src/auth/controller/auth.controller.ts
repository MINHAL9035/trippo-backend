import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/login.dto';
// import { RefreshTokenDto } from '../dto/refreshToken.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly _logger = new Logger(AuthController.name);
  constructor(private readonly _authService: AuthService) {}

  /**
   * Handles user login and sets response cookies.
   * @param loginDto - Contains user credentials.
   * @param res - Express response object for setting cookies.
   */
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this._authService.loginUser(loginDto, res);
      return result;
    } catch (error) {
      this._logger.error('Error during login', error.stack);
      throw error;
    }
  }

  /**
   * Handles token refresh by validating and issuing new tokens.
   * @param refreshTokenDto - Contains the refresh token.
   */

  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this._logger.log('Attempting to refresh token');
    try {
      const refreshToken = req.cookies['refreshToken'];
      if (!refreshToken) {
        throw new Error('Refresh token not found in cookie');
      }
      const result = await this._authService.refreshTokens(refreshToken, res);
      this._logger.log('Token refreshed successfully');
      return result;
    } catch (error) {
      this._logger.error('Error during token refresh', error.stack);
      throw error;
    }
  }

  /**
   * Logs out the user by clearing authentication cookies.
   * @param res - Express response object for clearing cookies.
   */
  @Post('logout')
  async userLogout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const refreshToken = req.cookies['refreshToken'];
      if (!refreshToken) {
        throw new Error('No refresh token found in cookies');
      }
      await this._authService.logout(res, refreshToken);
      this._logger.log('User logged out successfully');
    } catch (error) {
      this._logger.error('Error during logout', error.stack);
      throw error;
    }
  }
}
