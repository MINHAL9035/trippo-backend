import { Module } from '@nestjs/common';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './service/admin.service';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminLoginRepository } from './respository/admin.repository';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminRefreshTokenSchema } from './schema/adminRefreshToken.schema';
import { AdminHotelController } from './controller/adminHotel.controller';
import { AdminHotelService } from './service/adminHotel.service';
import { ownerRequestSchema } from '../hotel-owner/schema/PendingRequest.schema';
import { AdminHotelRepository } from './respository/adminHotel.repository';
import { OwnerSchema } from '../hotel-owner/schema/owner.schema';
import { unverifiedOwnerSchema } from '../hotel-owner/schema/UnverifiedOwnerSchema';
import { UnverifiedHotelSchema } from '../hotel-owner/schema/UnverifiedHotel';
import { HotelSchema } from '../hotel-owner/schema/HotelSchema';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: 'AdminRefreshToken', schema: AdminRefreshTokenSchema },
      { name: 'Owner', schema: OwnerSchema },
      { name: 'OwnerRequest', schema: ownerRequestSchema },
      { name: 'UnverifiedOwner', schema: unverifiedOwnerSchema },
      { name: 'UnverifiedHotel', schema: UnverifiedHotelSchema },
      { name: 'Hotel', schema: HotelSchema },
    ]),
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
  ],
  controllers: [AdminController, AdminHotelController],
  providers: [
    AdminService,
    AdminLoginRepository,
    JwtService,
    AdminHotelService,
    AdminHotelRepository,
  ],
})
export class AdminModule {}
