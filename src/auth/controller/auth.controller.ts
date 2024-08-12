import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refreshToken.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  /**
   * Handles user login and sets response cookies.
   * @param LoginDto - Contains user credentials.
   * @param res - Express response object for setting cookies.
   */
  @Post('login')
  async login(
    @Body() LoginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this._authService.login(LoginDto, res);
  }

  /**
   * Handles token refresh by validating and issuing new tokens.
   * @param RefreshTokenDto - Contains the refresh token.
   */
  @Post('refresh')
  async refreshToken(@Body() RefreshTokenDto: RefreshTokenDto) {
    return this._authService.refreshTokens(RefreshTokenDto.refreshToken);
  }

  /**
   * Logs out the user by clearing authentication cookies.
   * @param res - Express response object for clearing cookies.
   */
  @Post('logout')
  async userLogout(@Res({ passthrough: true }) res: Response) {
    return this._authService.userLogout(res);
  }
}
