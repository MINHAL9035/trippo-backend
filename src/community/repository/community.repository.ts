import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../schema/post.schema';
import { IPostInterface } from '../interface/IPost.interface';
import { User } from '../../user/schema/user.schema';
import { Types } from 'mongoose';
import { Group } from '../schema/group.schema';

@Injectable()
export class CommunityRepository {
  constructor(
    @InjectModel(Post.name) private _postModel: Model<Post>,
    @InjectModel(User.name) private _userModel: Model<User>,
    @InjectModel(Group.name) private _groupModel: Model<Group>,
  ) {}

  async createPost(postData: IPostInterface): Promise<Post> {
    const newPost = new this._postModel(postData);
    return await newPost.save();
  }

  async findPosts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await this._postModel
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId')
      .lean();
  }
  async findAllUsers() {
    return await this._userModel.find({});
  }
  async findSingleUserPosts(userId: Types.ObjectId) {
    return await this._postModel.find({ userId: userId });
  }
  async findSearchUsers(query: string) {
    const searchRegex = new RegExp(query, 'i');

    try {
      const users = await this._userModel
        .find({
          $or: [{ username: searchRegex }, { fullName: searchRegex }],
          is_blocked: false,
        })
        .select('fullName userName email image')
        .lean();

      return users;
    } catch (error) {
      throw new Error(`Error searching users: ${error.message}`);
    }
  }

  async findUserByUserName(userName: string) {
    return await this._userModel.findOne({ userName: userName });
  }

  async findGroup(groupId: string) {
    return await this._groupModel.findOne({ groupId: groupId });
  }
}
