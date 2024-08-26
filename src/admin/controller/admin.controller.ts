import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AdminLoginRepository } from '../respository/admin.repository';
import { LoginDto } from 'src/auth/dto/login.dto';
import { AdminService } from '../service/admin.service';
import { Response, Request } from 'express';
import { UpdateUserStatusDto } from '../dto/updateUserStatus.dto';
import { UserInterface } from 'src/user/interface/user/IUser.interface';

@Controller('admin')
export class AdminController {
  private readonly _logger = new Logger(AdminController.name);

  constructor(
    private readonly _adminrepository: AdminLoginRepository,
    private readonly _adminService: AdminService,
  ) {}

  @Post('adminLogin')
  async adminLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this._adminService.loginAdmin(loginDto, res);
      return result;
    } catch (error) {
      this._logger.error('Error during login', error.stack);
      throw error;
    }
  }

  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this._logger.log('Attempting to refresh token');
    try {
      const refreshToken = req.cookies['adminRefreshToken'];
      if (!refreshToken) {
        throw new Error('Refresh token not found in cookie');
      }
      const result = await this._adminService.AdminRefreshTokens(
        refreshToken,
        res,
      );
      this._logger.log('Token refreshed successfully');
      return result;
    } catch (error) {
      this._logger.error('Error during token refresh', error.stack);
      throw error;
    }
  }

  @Post('logout')
  async userLogout(@Res({ passthrough: true }) res: Response) {
    try {
      await this._adminService.logout(res);
      this._logger.log('User logged out successfully');
    } catch (error) {
      this._logger.error('Error during logout', error.stack);
      throw error;
    }
  }

  @Get('users')
  async getUsers(
    @Query('page') page: number = 1,
  ): Promise<{ users: UserInterface[]; totalPages: number }> {
    this._logger.log('Received request for users');
    try {
      const usersPerPage = 5;
      return this._adminService.getAllUsers(page, usersPerPage);
    } catch (error) {
      this._logger.error('Error during login', error.stack);
      throw error;
    }
  }

  @Patch('update-status')
  async updateStatus(@Body() updateUserStatusDto: UpdateUserStatusDto) {
    return this._adminService.updateStatus(updateUserStatusDto);
  }
}
