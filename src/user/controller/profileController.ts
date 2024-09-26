import {
  Body,
  Controller,
  Get,
  Logger,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { JwtUserGuard } from 'src/guards/jwtUserAuth.guard';
import { EditProfileDto } from '../dto/editProfile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { S3Service } from '../../aws/aws.service';
import { ProfileService } from '../service/profile.service';
@UseGuards(JwtUserGuard)
@Controller('users')
export class ProfileController {
  private readonly _logger = new Logger(ProfileController.name);
  constructor(
    private readonly _userService: UserService,
    private readonly _s3Service: S3Service,
    private readonly _profileService: ProfileService,
  ) {}

  /**
   * Fetches user details based on the provided email.
   *
   * @param email - The email of the user to retrieve details for.
   * @returns User details corresponding to the provided email.
   */
  @Get('getUserDetails')
  async getUserDetails(@Query('email') email: string) {
    return this._userService.getUserDetails(email);
  }

  @Put('editProfile')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async editUser(
    @UploadedFile() profilePicture: Express.Multer.File,
    @Body() editProfileDto: EditProfileDto,
  ) {
    console.log(profilePicture);

    const res = await this._s3Service.uploadFile(profilePicture);
    const response = await this._profileService.editProfile(
      editProfileDto,
      res.Location,
    );
    return response;
  }
}
