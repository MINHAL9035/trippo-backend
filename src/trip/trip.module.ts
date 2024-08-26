import { Module } from '@nestjs/common';
import { TripController } from './controller/trip.controller';
import { TripService } from './service/trip.service';
import { Triprepository } from './repository/tripRepository';
import { MongooseModule } from '@nestjs/mongoose';
import { TripSchema } from './schema/tripSchema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Trip', schema: TripSchema }])],
  controllers: [TripController],
  providers: [TripService, Triprepository],
  exports: [MongooseModule],
})
export class TripModule {}
