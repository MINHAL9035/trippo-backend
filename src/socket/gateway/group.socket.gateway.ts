import { InjectModel } from '@nestjs/mongoose';
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
import { Model } from 'mongoose';
import { Group } from '../../community/schema/group.schema';
import { GroupMessage } from '../schema/group.message.schema';

@WebSocketGateway({ cors: true })
export class GroupGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(Group.name) private _groupModel: Model<Group>,
    @InjectModel(GroupMessage.name)
    private _groupMessageModel: Model<GroupMessage>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  private generateBookingId(): string {
    const prefix = 'TPG';
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${prefix}${randomNum}`;
  }

  @SubscribeMessage('createGroup')
  async handleCreateGroup(
    @MessageBody() data: { groupName: string; selectedUsers: string[] },
  ) {
    try {
      const newGroup = new this._groupModel({
        groupId: this.generateBookingId(),
        name: data.groupName,
        members: data.selectedUsers,
        createdAt: new Date(),
      });

      await newGroup.save();

      data.selectedUsers.forEach((userId) => {
        this.server.to(userId).emit('newGroupCreated', newGroup);
      });

      return { status: 'success', group: newGroup };
    } catch (error) {
      console.error(error);
      throw new Error();
    }
  }

  @SubscribeMessage('getGroups')
  async handleGetGroups(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const groups = await this._groupModel.find({ members: data.userId });
      console.log('groups', groups);

      client.emit('groupList', groups);

      return { status: 'success' };
    } catch (error) {
      console.log(error);
      throw new Error('Failed to retrieve and emit group data');
    }
  }

  @SubscribeMessage('joinGroupChat')
  handleJoinGroup(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.groupId);
    return { status: 'joined' };
  }

  @SubscribeMessage('leaveGroupChat')
  handleLeaveGroup(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.groupId);
    return { status: 'left' };
  }

  @SubscribeMessage('sendGroupMessage')
  async handleGroupMessage(
    @MessageBody() data: { groupId: string; content: string; senderId: string },
  ) {
    try {
      const newMessage = new this._groupMessageModel({
        groupId: data.groupId,
        senderId: data.senderId,
        content: data.content,
        readBy: [data.senderId],
      });

      await newMessage.save();

      const populatedMessage = await newMessage.populate(
        'senderId',
        'fullName userName image',
      );

      this.server.to(data.groupId).emit('newGroupMessage', populatedMessage);

      return { status: 'success', message: populatedMessage };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to send group message');
    }
  }

  @SubscribeMessage('getGroupMessages')
  async handleGetGroupMessages(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const messages = await this._groupMessageModel
        .find({ groupId: data.groupId })
        .populate('senderId', 'fullName userName image')
        .sort({ createdAt: 1 });

      client.emit('groupMessages', messages);

      return { status: 'success' };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to retrieve group messages');
    }
  }
}
