import { Module } from '@nestjs/common';
import { TripController } from './controller/trip.controller';
import { TripService } from './service/trip.service';
import { Triprepository } from './repository/tripRepository';
import { MongooseModule } from '@nestjs/mongoose';
import { TripSchema } from './schema/tripSchema';
import { S3Service } from '../aws/aws.service';
import { UserSchema } from '../user/schema/user.schema';
import { RefreshTokenSchema } from '../auth/schema/refresh.token.schema';
import { LoginRepository } from '../auth/repository/login.repository';
import { AiTripSchema } from './schema/aiTrip.schema';
import { SavedPlaceSchema } from './schema/savePlace.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Trip', schema: TripSchema },
      { name: 'User', schema: UserSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema },
      { name: 'AiTrip', schema: AiTripSchema },
      { name: 'SavedPlace', schema: SavedPlaceSchema },
    ]),
  ],
  controllers: [TripController],
  providers: [TripService, Triprepository, S3Service, LoginRepository],
  exports: [MongooseModule],
})
export class TripModule {}
