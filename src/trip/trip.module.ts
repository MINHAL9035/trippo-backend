import { Module } from '@nestjs/common';
import { TripController } from './controller/trip.controller';
import { TripService } from './service/trip.service';
import { Triprepository } from './repository/tripRepository';
import { MongooseModule } from '@nestjs/mongoose';
import { TripSchema } from './schema/tripSchema';
import { S3Service } from 'src/aws/aws.service';
import { UserSchema } from 'src/user/schema/user.schema';
import { RefreshTokenSchema } from 'src/auth/schema/refresh.token.schema';
import { LoginRepository } from 'src/auth/repository/login.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Trip', schema: TripSchema },
      { name: 'User', schema: UserSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema },
    ]),
  ],
  controllers: [TripController],
  providers: [TripService, Triprepository, S3Service, LoginRepository],
  exports: [MongooseModule],
})
export class TripModule {}
