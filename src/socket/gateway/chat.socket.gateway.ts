import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SocketService } from '../service/socket.service';
import { Message } from '../schema/message.schema';
import { Group } from '../schema/group.schema';

interface MessagePayload {
  message: {
    senderId: string;
    receiverId: string;
    content: string;
  };
}

interface GroupMessagePayload {
  groupId: string;
  message: {
    senderId: string;
    content: string;
  };
}

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSocketMap: Map<string, string> = new Map();

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Group.name) private groupModel: Model<Group>,
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
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    this.userSocketMap.set(userId, client.id);
    console.log(`User ${userId} registered with socket ${client.id}`);
  }

  @SubscribeMessage('createGroup')
  async handleCreateGroup(
    client: Socket,
    payload: { name: string; members: string[] },
  ) {
    try {
      const newGroup = new this.groupModel({
        name: payload.name,
        members: payload.members.map((id) => new Types.ObjectId(id)),
        createdBy: payload.members[0], // Assuming the first member is the creator
        createdAt: new Date(),
      });

      const savedGroup = await newGroup.save();

      // Notify all group members
      payload.members.forEach((memberId) => {
        const memberSocketId = this.userSocketMap.get(memberId);
        if (memberSocketId) {
          this.server.to(memberSocketId).emit('groupCreated', savedGroup);
        }
      });

      return savedGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  @SubscribeMessage('joinGroup')
  async handleJoinGroup(
    client: Socket,
    payload: { groupId: string; userId: string },
  ) {
    try {
      const payUserId = new Types.ObjectId(payload.userId);
      const group = await this.groupModel.findById(payload.groupId);
      if (!group.members.includes(payUserId)) {
        group.members.push(new Types.ObjectId(payload.userId));
        await group.save();

        // Notify all group members
        group.members.forEach((memberId) => {
          const memberSocketId = this.userSocketMap.get(memberId.toString());
          if (memberSocketId) {
            this.server.to(memberSocketId).emit('userJoinedGroup', {
              groupId: payload.groupId,
              userId: payload.userId,
            });
          }
        });
      }
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  @SubscribeMessage('sendGroupMessage')
  async handleGroupMessage(client: Socket, payload: GroupMessagePayload) {
    try {
      const newMessage = new this.messageModel({
        senderId: new Types.ObjectId(payload.message.senderId),
        groupId: new Types.ObjectId(payload.groupId),
        content: payload.message.content,
        createdAt: new Date(),
      });

      const savedMessage = await newMessage.save();
      const group = await this.groupModel.findById(payload.groupId);

      // Broadcast message to all group members
      group.members.forEach((memberId) => {
        const memberSocketId = this.userSocketMap.get(memberId.toString());
        if (memberSocketId) {
          this.server.to(memberSocketId).emit('groupMessage', {
            groupId: payload.groupId,
            message: savedMessage,
          });
        }
      });

      return savedMessage;
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  }

  // Existing message handling...
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
}
