import { Module } from '@nestjs/common';
import { OwnerController } from './controller/owner.controller';
import { OtpService } from '../user/service/otp.service';
import { OtpRepository } from '../user/repository/Otp.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpSchema } from '../user/schema/Otp.schema';
import { OwnerRepository } from './repository/ownerRepository';
import { unverifiedOwnerSchema } from './schema/UnverifiedOwnerSchema';
import { HotelOwnerService } from './service/hotelOwner.service';
import { HotelController } from './controller/hotel.controller';
import { HotelService } from './service/hotel.service';
import { HotelSchema } from './schema/HotelSchema';
import { HotelRepository } from './repository/hotelRepository';
import { ownerRequestSchema } from './schema/PendingRequest.schema';
import { OwnerSchema } from './schema/owner.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { OwnerRefreshTokenSchema } from './schema/ownerRefreshToken.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UnverifiedHotelSchema } from './schema/UnverifiedHotel';
import { S3Service } from '../aws/aws.service';
import { CompletedBookingSchema } from '../user/schema/completedBookings.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (ConfigService: ConfigService) => ({
        global: true,
        secret: ConfigService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: ConfigService.get<string>('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'Otp', schema: OtpSchema },
      { name: 'UnverifiedOwner', schema: unverifiedOwnerSchema },
      { name: 'Hotel', schema: HotelSchema },
      { name: 'UnverifiedHotel', schema: UnverifiedHotelSchema },
      { name: 'OwnerRequest', schema: ownerRequestSchema },
      { name: 'Owner', schema: OwnerSchema },
      { name: 'OwnerRefreshToken', schema: OwnerRefreshTokenSchema },
      { name: 'CompletedBooking', schema: CompletedBookingSchema },
    ]),
  ],
  controllers: [OwnerController, HotelController],
  providers: [
    OtpService,
    OtpRepository,
    HotelOwnerService,
    OwnerRepository,
    HotelService,
    HotelRepository,
    JwtService,
    S3Service,
  ],
})
export class HotelOwnerModule {}
