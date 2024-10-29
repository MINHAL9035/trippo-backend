import { Injectable, Logger } from '@nestjs/common';
import { CreatePostdto } from '../dto/createPost.dto';
import { Types } from 'mongoose';
import { CommunityRepository } from '../repository/community.repository';
import { IPostInterface } from '../interface/IPost.interface';
@Injectable()
export class CommunityService {
  private readonly _logger = new Logger(CommunityService.name);
  constructor(private readonly _communityRepository: CommunityRepository) {}

  async createPost(
    createPostdto: CreatePostdto,
    imageLocations: string[],
    userId: Types.ObjectId,
  ) {
    try {
      const postData: IPostInterface = {
        ...createPostdto,
        imageUrl: imageLocations,
        userId,
      };
      return await this._communityRepository.createPost(postData);
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }

  async getPosts() {
    try {
      return await this._communityRepository.findPosts();
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }
  async getAllUsers() {
    try {
      return await this._communityRepository.findAllUsers();
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }

  async getUserPost(userId: Types.ObjectId) {
    try {
      return await this._communityRepository.findSingleUserPosts(userId);
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }

  async searchUser(query: string) {
    try {
      const users = await this._communityRepository.findSearchUsers(query);
      return users;
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }
}
