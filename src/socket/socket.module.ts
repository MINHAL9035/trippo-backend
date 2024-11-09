import { Module } from '@nestjs/common';
import { CommunityService } from '../community/service/community.service';
import { CommunityRepository } from '../community/repository/community.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from '../community/schema/post.schema';
import { UserSchema } from '../user/schema/user.schema';
import { NotificationSchema } from '../community/schema/notification.schema';
import { MessageSchema } from './schema/message.schema';
import { ChatGateway } from './gateway/chat.socket.gateway';
import { GroupSchema } from '../community/schema/group.schema';
import { GroupGateway } from './gateway/group.socket.gateway';
import { GroupMessageSchema } from './schema/group.message.schema';
import { PostSocketGateway } from './gateway/post.socket.gateway';
import { CommentSchema } from '../community/schema/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'Message', schema: MessageSchema },
      { name: 'GroupMessage', schema: GroupMessageSchema },
      { name: 'Group', schema: GroupSchema },
      { name: 'Comment', schema: CommentSchema },
    ]),
  ],
  controllers: [],
  providers: [
    CommunityService,
    CommunityRepository,
    ChatGateway,
    GroupGateway,
    PostSocketGateway,
  ],
})
export class SocketModule {}
