import { Module } from '@nestjs/common';
import { ChatGateway } from './socket-io.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from './schema/message.schema';
import { SocketController } from './controller/socket-io.controller';
import { SocketService } from './service/socket-io.service';
import { PostSchema } from 'src/community/schema/post.schema';
import { NotificationSchema } from 'src/community/schema/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Message', schema: MessageSchema },
      { name: 'Post', schema: PostSchema },
      { name: 'Notification', schema: NotificationSchema },
    ]),
  ],
  controllers: [SocketController],
  providers: [ChatGateway, SocketService],
})
export class SocketIoModule {}
