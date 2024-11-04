import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from '../../community/schema/post.schema';
import {
  Notification,
  NotificationType,
} from '../../community/schema/notification.schema';
import { Message } from '../schema/message.schema';
@Injectable()
export class SocketService {
  private readonly _logger = new Logger(SocketService.name);
  constructor(
    @InjectModel(Message.name) private _messageModel: Model<Message>,
    @InjectModel(Post.name) private _postModel: Model<Post>,
    @InjectModel(Notification.name)
    private _notificationModel: Model<Notification>,
  ) {}
  async getMessagesBetweenUsers(
    senderId: string,
    receiverId: string,
  ): Promise<Message[]> {
    const senderObjectId = new Types.ObjectId(senderId);
    const receiverObjectId = new Types.ObjectId(receiverId);
    return this._messageModel
      .find({
        $or: [
          { senderId: senderObjectId, receiverId: receiverObjectId },
          { senderId: receiverObjectId, receiverId: senderObjectId },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }
  async getMessageList(userId: string) {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const messages = await this._messageModel.aggregate([
        {
          $match: {
            $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
          },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$senderId', userObjectId] },
                '$receiverId',
                '$senderId',
              ],
            },
            lastMessage: { $last: '$$ROOT' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $project: {
            _id: 1,
            name: '$userDetails.userName',
            image: '$userDetails.image',
            lastMessage: '$lastMessage.content',
            lastMessageDate: '$lastMessage.createdAt',
          },
        },
        {
          $sort: { lastMessageDate: -1 },
        },
      ]);
      return messages;
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }
  async likePost(postId: string, userId: string) {
    const newUserId = new Types.ObjectId(userId);
    const post = await this._postModel.findById(postId).populate('userId');
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const isLiked = post.likes.some((id) => id.equals(newUserId));
    if (isLiked) {
      post.likes = post.likes.filter((id) => !id.equals(newUserId));
      await this._notificationModel.deleteOne({
        postId: post._id,
        triggeredBy: newUserId,
        type: NotificationType.LIKE,
      });
    } else {
      post.likes.push(newUserId);
      if (!post.userId._id.equals(newUserId)) {
        const notification = new this._notificationModel({
          userId: post.userId._id,
          triggeredBy: newUserId,
          postId: post._id,
          type: NotificationType.LIKE,
        });
        await notification.save();
      }
    }
    await post.save();
    return post;
  }
  async getNotifications(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return this._notificationModel
      .find({ userId: userObjectId })
      .populate('triggeredBy', 'fullName userName image')
      .populate('postId', 'imageUrl')
      .sort({ createdAt: -1 })
      .exec();
  }
}
