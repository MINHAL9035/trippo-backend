import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EditProfileDto } from '../dto/editProfile.dto';

@Injectable()
export class ProfileService {
  private readonly _logger = new Logger(ProfileService.name);
  constructor() {}

  async editProfile(editUserDetails: EditProfileDto, imageLocation) {
    try {
    } catch (error) {
      this._logger.error(`Failed to edit user ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to edit user');
    }
  }
}
