import { Module } from '@nestjs/common';
import { CommunityController } from './controller/community.controller';
import { CommunityService } from './service/community.service';
import { CommunityRepository } from './repository/community.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './schema/post.schema';
import { S3Service } from 'src/aws/aws.service';
import { UserSchema } from 'src/user/schema/user.schema';
import { RefreshTokenSchema } from 'src/auth/schema/refresh.token.schema';
import { LoginRepository } from 'src/auth/repository/login.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'User', schema: UserSchema },
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
