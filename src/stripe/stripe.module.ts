import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PendingBookingSchema } from '../user/schema/pendingBooking.schema';
import { CompletedBookingSchema } from '../user/schema/completedBookings.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PendingBooking', schema: PendingBookingSchema },
      { name: 'CompletedBooking', schema: CompletedBookingSchema },
    ]),
    UserModule,
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
