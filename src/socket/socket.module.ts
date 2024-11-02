import { Module } from '@nestjs/common';
import { PostSocketGateway } from './gateway/socket.gateway';
import { CommunityService } from 'src/community/service/community.service';
import { CommunityRepository } from 'src/community/repository/community.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from 'src/community/schema/post.schema';
import { UserSchema } from 'src/user/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [],
  providers: [PostSocketGateway, CommunityService, CommunityRepository],
})
export class SocketModule {}
