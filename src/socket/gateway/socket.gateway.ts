import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CommunityService } from 'src/community/service/community.service';
import { LikeDto } from '../dto/like.dto';

@WebSocketGateway({ cors: true })
export class PostSocketGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly _communityService: CommunityService) {}

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
}
