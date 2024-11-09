import { Module } from '@nestjs/common';
import { CommunityController } from './controller/community.controller';
import { CommunityService } from './service/community.service';
import { CommunityRepository } from './repository/community.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './schema/post.schema';
import { S3Service } from '../aws/aws.service';
import { UserSchema } from '../user/schema/user.schema';
import { RefreshTokenSchema } from '../auth/schema/refresh.token.schema';
import { LoginRepository } from '../auth/repository/login.repository';
import { GroupSchema } from './schema/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Group', schema: GroupSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema },
    ]),
  ],
  controllers: [CommunityController],
  providers: [
    CommunityService,
    CommunityRepository,
    S3Service,
    LoginRepository,
  ],
})
export class CommunityModule {}
