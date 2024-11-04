import { Module } from '@nestjs/common';
import { CommunityService } from '../community/service/community.service';
import { CommunityRepository } from '../community/repository/community.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from '../community/schema/post.schema';
import { UserSchema } from '../user/schema/user.schema';
import { NotificationSchema } from '../community/schema/notification.schema';
import { PostSocketGateway } from './gateway/post.socket.gateway';
import { SocketController } from './controller/socket.controller';
import { SocketService } from './service/socket.service';
import { MessageSchema } from './schema/message.schema';
import { ChatGateway } from './gateway/chat.socket.gateway';
import { GroupSchema } from './schema/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'Message', schema: MessageSchema },
      { name: 'Group', schema: GroupSchema },
    ]),
  ],
  controllers: [SocketController],
  providers: [
    PostSocketGateway,
    CommunityService,
    CommunityRepository,
    SocketService,
    ChatGateway,
  ],
})
export class SocketModule {}
