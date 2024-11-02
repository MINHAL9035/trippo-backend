import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/login.dto';
import { Request, Response } from 'express';
import { JwtUserGuard } from '../../guards/jwtUserAuth.guard';
import { GoogleAuthDto } from '../dto/googleAuth.dto';

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
    this._logger.log('loginDto', loginDto);
    const result = await this._authService.loginUser(loginDto, res);
    return result;
  }

  /**
   * Handles Google login
   * @param GoogleAuthDto - Data Transfer Object for Google authentication
   * @param res - HTTP response object
   * @returns - The response from the Google login service
   */
  @Post('google-login')
  async googleLogin(
    @Body() GoogleAuthDto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const response = await this._authService.googleLogin(GoogleAuthDto, res);
    return response;
  }

  /**
   * Handles token refresh by validating and issuing new tokens.
   * @param req - The incoming request containing the refresh token in cookies.
   * @param res - The outgoing response used to set new cookies.
   * @returns The newly issued tokens.
   */
  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['userRefreshToken'];
    const tokens = await this._authService.refreshTokens(refreshToken, res);
    return tokens;
  }

  /**
   * Logs out the user by clearing authentication cookies.
   * @param res - Express response object for clearing cookies.
   */
  @UseGuards(JwtUserGuard)
  @Post('logout')
  async userLogout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['userRefreshToken'];
    const response = this._authService.logout(res, refreshToken);
    return response;
  }
}
