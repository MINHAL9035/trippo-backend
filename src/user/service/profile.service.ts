import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EditProfileDto } from '../dto/editProfile.dto';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class ProfileService {
  private readonly _logger = new Logger(ProfileService.name);
  constructor(private readonly _userRepository: UserRepository) {}

  async editProfile(
    userId: string,
    editUserDetails: EditProfileDto,
    imageLocation,
  ) {
    try {
      const user = await this._userRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const updateData = {
        ...editUserDetails,
        ...(imageLocation && { image: imageLocation }),
      };
      return this._userRepository.updateUser(userId, updateData);
    } catch (error) {
      this._logger.error(`Failed to edit user ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to edit user');
    }
  }
}
