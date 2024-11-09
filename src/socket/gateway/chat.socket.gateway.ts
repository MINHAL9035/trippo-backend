import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '../schema/message.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../user/schema/user.schema';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  private getRoomId(user1Id: string, user2Id: string): string {
    return [user1Id, user2Id].sort().join('-');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('initializeChat')
  async handleInitializeChat(
    @MessageBody() data: { currentUserId: string; otherUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const roomId = this.getRoomId(data.currentUserId, data.otherUserId);
      client.join(roomId);

      const messages = await this.messageModel
        .find({
          $or: [
            { senderId: data.currentUserId, receiverId: data.otherUserId },
            { senderId: data.otherUserId, receiverId: data.currentUserId },
          ],
        })
        .sort({ createdAt: 1 })
        .exec();

      client.emit('previousMessages', messages);

      return { status: 'success', roomId };
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      senderId: string;
      receiverId: string;
      content: string;
    },
  ) {
    try {
      const newMessage = new this.messageModel({
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        createdAt: new Date(),
      });

      await newMessage.save();

      const roomId = this.getRoomId(data.senderId, data.receiverId);
      this.server.to(roomId).emit('receiveMessage', newMessage);

      return { status: 'success' };
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @MessageBody() data: { currentUserId: string; otherUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = this.getRoomId(data.currentUserId, data.otherUserId);
    client.leave(roomId);
    return { status: 'success' };
  }

  @SubscribeMessage('getUserMessageList')
  async handleSendMessageList(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const messages = await this.messageModel
        .find({
          $or: [{ senderId: data.userId }, { receiverId: data.userId }],
        })
        .populate('senderId')
        .populate('receiverId')
        .sort({ createdAt: 1 })
        .exec();

      const userIds = new Set();
      messages.forEach((message) => {
        userIds.add(message.senderId._id.toString());
        userIds.add(message.receiverId._id.toString());
      });
      userIds.delete(data.userId);
      const users = await this.userModel
        .find({
          _id: { $in: Array.from(userIds) },
        })
        .select('_id fullName userName image')
        .exec();

      client.emit('userList', users);
      return { status: 'success' };
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
}
