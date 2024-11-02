import { Injectable, Logger } from '@nestjs/common';
import { CreatePostdto } from '../dto/createPost.dto';
import { Model, Types } from 'mongoose';
import { CommunityRepository } from '../repository/community.repository';
import { IPostInterface } from '../interface/IPost.interface';
import { Post } from '../schema/post.schema';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class CommunityService {
  private readonly _logger = new Logger(CommunityService.name);
  constructor(
    private readonly _communityRepository: CommunityRepository,
    @InjectModel(Post.name) private _postModel: Model<Post>,
  ) {}

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

  async toggleLike(postId: string, userId: string) {
    const post = await this._postModel.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const isLiked = post.likes.some((likedUserId) =>
      likedUserId.equals(userObjectId),
    );

    if (isLiked) {
      post.likes = post.likes.filter(
        (likedUserId) => !likedUserId.equals(userObjectId),
      );
    } else {
      post.likes.push(userObjectId);
    }

    return post.save();
  }
}
