import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { UserRepository } from './repository/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schema';
import { unverifiedUserSchema } from './schema/UnverifiedUser.schema';
import { OtpSchema } from './schema/Otp.schema';
import { OtpService } from './service/otp.service';
import { OtpRepository } from './repository/Otp.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UnverifiedUser', schema: unverifiedUserSchema },
      { name: 'Otp', schema: OtpSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, OtpService, OtpRepository],
  exports: [UserService, UserRepository, MongooseModule],
})
export class UserModule {}
