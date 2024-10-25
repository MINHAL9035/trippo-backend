import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from './schema/message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SocketService } from './service/socket-io.service';
import {
  Notification,
  NotificationType,
} from 'src/community/schema/notification.schema';

interface MessagePayload {
  message: {
    senderId: string;
    receiverId: string;
    content: string;
  };
}

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSocketMap: Map<string, string> = new Map();

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,

    private readonly _socketService: SocketService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        break;
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    this.userSocketMap.set(userId, client.id);
    console.log(`User ${userId} registered with socket ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: MessagePayload) {
    const { message } = payload;

    const newMessage = new this.messageModel({
      senderId: new Types.ObjectId(message.senderId),
      receiverId: new Types.ObjectId(message.receiverId),
      content: message.content,
    });
    await newMessage.save();
    client.emit('newMessage', newMessage);
    const receiverSocketId = this.userSocketMap.get(message.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', newMessage);
    }
  }

  @SubscribeMessage('likePost')
  async handleLikePost(
    client: Socket,
    payload: { postId: string; userId: string },
  ) {
    const updatedPost = await this._socketService.likePost(
      payload.postId,
      payload.userId,
    );
    this.server.emit('post_liked', {
      postId: payload.postId,
      userId: payload.userId,
      likes: updatedPost.likes,
    });
    const notification = await this.notificationModel
      .findOne({
        postId: payload.postId,
        triggeredBy: payload.userId,
        type: NotificationType.LIKE,
      })
      .populate('triggeredBy', 'fullName userName image')
      .populate('postId', 'imageUrl');

    if (notification) {
      const ownerSocketId = this.userSocketMap.get(
        updatedPost.userId.toString(),
      );
      if (ownerSocketId) {
        this.server.to(ownerSocketId).emit('new_notification', notification);
      }
    }

    return updatedPost;
  }
}
