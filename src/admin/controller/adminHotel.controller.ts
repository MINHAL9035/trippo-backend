import {
  Controller,
  Get,
  Logger,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminHotelService } from '../service/adminHotel.service';
import { Types } from 'mongoose';
import { JwtAdminGuard } from 'src/guards/jwtAdminAuth.guard';

@UseGuards(JwtAdminGuard)
@Controller('admin')
export class AdminHotelController {
  private readonly _logger = new Logger(AdminHotelController.name);
  constructor(private readonly _adminHotelService: AdminHotelService) {}
  @Get('getRequests')
  async getRequests() {
    return await this._adminHotelService.getRequets();
  }

  @Patch('updateStatus')
  async updateOwnerStatus(
    @Query('ownerId') ownerId: string,
    @Query('action') action: 'accepted' | 'rejected',
  ) {
    const newOwnerId = new Types.ObjectId(ownerId);
    const response = await this._adminHotelService.updateStatus(
      newOwnerId,
      action,
    );
    return response;
  }
}
