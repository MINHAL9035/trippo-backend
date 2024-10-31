import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostdto } from '../dto/createPost.dto';
import { S3Service } from 'src/aws/aws.service';
import { CommunityService } from '../service/community.service';
import { JwtUserGuard } from 'src/guards/jwtUserAuth.guard';
import { Types } from 'mongoose';
import { CommunityRepository } from '../repository/community.repository';

@UseGuards(JwtUserGuard)
@Controller('community')
export class CommunityController {
  private readonly _logger = new Logger(CommunityController.name);
  constructor(
    private readonly _communityService: CommunityService,
    private readonly _s3Service: S3Service,
    private readonly _communityRepository: CommunityRepository,
  ) {}

  @Post('createPost')
  @UseInterceptors(
    FilesInterceptor('postImages', 10, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
      },
    }),
  )
  async createPost(
    @Req() request,
    @Body() createPostdto: CreatePostdto,
    @UploadedFiles() postImages: Array<Express.Multer.File>,
  ) {
    try {
      const userId = request.user._id;

      // Process files sequentially instead of parallel
      const imageLocations = [];
      for (const image of postImages) {
        const uploaded = await this._s3Service.uploadFile(image);
        imageLocations.push(uploaded.Location);
        // Clear the buffer after upload
        delete image.buffer;
      }

      const post = await this._communityService.createPost(
        createPostdto,
        imageLocations,
        userId,
      );
      return post;
    } catch (error) {
      this._logger.error('Error in createPost:', error);
      throw error;
    }
  }

  @Get('getPosts')
  async getPosts() {
    return await this._communityService.getPosts();
  }

  @Get('getAllUsers')
  async getAllUsers() {
    return await this._communityService.getAllUsers();
  }
  @Get('getUserPost')
  async getUserPost(@Query('userId') userId: string) {
    const newUserId = new Types.ObjectId(userId);
    return await this._communityService.getUserPost(newUserId);
  }

  @Get('searchUsers')
  async searchUsers(@Query('query') query: string) {
    const users = await this._communityService.searchUser(query);
    return users;
  }

  @Get('searchUserDetails')
  async searchUserDetails(@Query('userName') userName: string) {
    const user = await this._communityRepository.findUserByUserName(userName);

    const posts = await this._communityRepository.findSingleUserPosts(
      user._id as Types.ObjectId,
    );

    return {
      ...user.toObject(),
      posts: posts.map((post) => ({
        id: post._id,
        imageUrls: post.imageUrl,
        description: post.description,
        place: post.place,
      })),
    };
  }
}
