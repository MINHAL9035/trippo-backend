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
import { LoginRepository } from '../auth/repository/login.repository';
import { RefreshTokenSchema } from '../auth/schema/refresh.token.schema';
import { ProfileController } from './controller/profileController';
import { AwsModule } from '../aws/aws.module';
import { S3Service } from '../aws/aws.service';
import { ProfileService } from './service/profile.service';
import { HotelSchema } from '../hotel-owner/schema/HotelSchema';
import { PendingBookingSchema } from './schema/pendingBooking.schema';
import { CompletedBookingSchema } from './schema/completedBookings.schema';
import { WalletSchema } from './schema/wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UnverifiedUser', schema: unverifiedUserSchema },
      { name: 'Otp', schema: OtpSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema },
      { name: 'Hotel', schema: HotelSchema },
      { name: 'PendingBooking', schema: PendingBookingSchema },
      { name: 'CompletedBooking', schema: CompletedBookingSchema },
      { name: 'Wallet', schema: WalletSchema },
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
