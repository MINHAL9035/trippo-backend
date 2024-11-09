import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommunityService } from '../../community/service/community.service';
import { LikeDto } from '../dto/like.dto';
import { CreateCommentDto } from '../dto/createComment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from '../../community/schema/comment.schema';
import { Model, Types } from 'mongoose';

@WebSocketGateway({ cors: true })
export class PostSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly _communityService: CommunityService,
    @InjectModel(Comment.name) private readonly _commentModel: Model<Comment>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('like_post')
  async handleLikePost(@MessageBody() likeDto: LikeDto) {
    try {
      const updatedPost = await this._communityService.toggleLike(
        likeDto.postId,
        likeDto.userId,
      );

      this.server.emit('post_liked', {
        postId: likeDto.postId,
        likes: updatedPost.likes,
        userId: likeDto.userId,
      });

      return updatedPost;
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('create-comment')
  async handleCreateComment(@MessageBody() commentDto: CreateCommentDto) {
    try {
      const newComment = new this._commentModel({
        postId: new Types.ObjectId(commentDto.postId),
        userId: new Types.ObjectId(commentDto.userId),
        text: commentDto.text,
      });

      const savedComment = await newComment.save();

      // Populate user details before sending
      const populatedComment = await savedComment.populate(
        'userId',
        'fullName userName image',
      );

      // Emit to all connected clients
      this.server.emit('new_comment', {
        postId: commentDto.postId,
        comment: populatedComment,
      });

      return populatedComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw new Error('Failed to create comment');
    }
  }

  @SubscribeMessage('get-comments')
  async handleGetComments(@MessageBody() data: { postId: string }) {
    try {
      const comments = await this._commentModel
        .find({ postId: new Types.ObjectId(data.postId) })
        .populate('userId', 'fullName userName image')
        .sort({ createdAt: -1 });

      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }
  }
}
