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
import { LoginRepository } from 'src/auth/repository/login.repository';
import { RefreshTokenSchema } from 'src/auth/schema/refresh.token.schema';
import { ProfileController } from './controller/profileController';
import { AwsModule } from 'src/aws/aws.module';
import { S3Service } from 'src/aws/aws.service';
import { ProfileService } from './service/profile.service';
import { HotelSchema } from 'src/hotel-owner/schema/HotelSchema';
import { PendingBookingSchema } from './schema/pendingBooking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UnverifiedUser', schema: unverifiedUserSchema },
      { name: 'Otp', schema: OtpSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema },
      { name: 'Hotel', schema: HotelSchema },
      { name: 'PendingBooking', schema: PendingBookingSchema },
    ]),
    AwsModule,
  ],
  controllers: [UserController, ProfileController],
  providers: [
    UserService,
    UserRepository,
    OtpService,
    OtpRepository,
    LoginRepository,
    S3Service,
    ProfileService,
  ],
  exports: [UserService, UserRepository, MongooseModule],
})
export class UserModule {}
