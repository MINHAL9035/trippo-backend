import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel } from '../hotel-owner/schema/HotelSchema';
import { CompletedBooking } from '../user/schema/completedBookings.schema';
import { PendingBooking } from '../user/schema/pendingBooking.schema';
import Stripe from 'stripe';
import { Types } from 'mongoose';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(PendingBooking.name)
    private pendingBookingModel: Model<PendingBooking>,
    @InjectModel(CompletedBooking.name)
    private completedBookingModel: Model<CompletedBooking>,
    @InjectModel(Hotel.name)
    private _hotelModel: Model<Hotel>,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2024-06-20',
      },
    );
  }

  private async validateRoomAvailability(
    hotelId: Types.ObjectId,
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    rooms: number,
  ) {
    try {
      const hotel = await this._hotelModel.findById(hotelId);

      if (!hotel) return false;

      const room = hotel.rooms.find((r) => r.roomId === roomId);
      if (!room) return false;

      // Check if the room has enough available units
      if (room.available < rooms) return false;

      const checkInDateTime = new Date(checkIn).getTime();
      const checkOutDateTime = new Date(checkOut).getTime();

      // Find the earliest and latest available dates
      const earliestAvailableDate = Math.min(
        ...room.availableDates.map((date) => new Date(date).getTime()),
      );
      const latestAvailableDate = Math.max(
        ...room.availableDates.map((date) => new Date(date).getTime()),
      );

      console.log('Earliest available date:', earliestAvailableDate);
      console.log('Latest available date:', latestAvailableDate);

      // Check if the check-in and check-out fall within the available range
      const isWithinAvailableRange =
        checkInDateTime >= earliestAvailableDate &&
        checkOutDateTime <= latestAvailableDate;

      return isWithinAvailableRange;
    } catch (error) {
      console.log(error);
      throw new Error('Error while validating room availability');
    }
  }

  private async updateRoomAvailability(
    hotelId: Types.ObjectId,
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    rooms: number,
  ): Promise<void> {
    const hotel = await this._hotelModel.findById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const roomIndex = hotel.rooms.findIndex((r) => r.roomId === roomId);
    if (roomIndex === -1) {
      throw new Error('Room not found');
    }

    hotel.rooms[roomIndex].available -= rooms;

    const checkInDateTime = new Date(checkIn).getTime();
    const checkOutDateTime = new Date(checkOut).getTime();

    hotel.rooms[roomIndex].availableDates = hotel.rooms[
      roomIndex
    ].availableDates.filter((date) => {
      const dateTime = new Date(date).getTime();
      return dateTime < checkInDateTime || dateTime > checkOutDateTime;
    });

    if (hotel.rooms[roomIndex].available === 0) {
      hotel.rooms[roomIndex].availableDates = [];
    }

    await hotel.save();
  }

  async createCheckoutSession(
    bookingId: string,
    amount: number,
    currency: string,
  ): Promise<any> {
    try {
      const pendingBooking = await this.pendingBookingModel.findOne({
        bookingId: bookingId,
      });

      if (!pendingBooking) {
        throw new BadRequestException('Pending booking not found');
      }

      const isAvailable = await this.validateRoomAvailability(
        pendingBooking.hotelId,
        pendingBooking.roomId,
        pendingBooking.checkIn,
        pendingBooking.checkOut,
        pendingBooking.rooms,
      );

      if (!isAvailable) {
        throw new BadRequestException(
          'Selected rooms are no longer available for the chosen dates',
        );
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: `Booking #${bookingId}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          bookingId: bookingId,
        },
        mode: 'payment',
        success_url: `${this.configService.get('FRONTEND_URL')}/bookingSuccess?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/bookingDetails/${pendingBooking.bookingId}`,
      });

      return { id: session.id, url: session.url };
    } catch (error) {
      throw error;
    }
  }

  async handleWebhookEvent(signature: string, payload: Buffer): Promise<void> {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    console.log('dsjb', webhookSecret);
    console.log('ds', signature);

    if (!webhookSecret) {
      this.logger.error('Stripe webhook secret is not set');
      throw new Error('Stripe webhook secret is not set');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const bookingId = session.metadata.bookingId;
        await this.handleSuccessfulPayment(session, bookingId);
      }
    } catch (err) {
      this.logger.error(`Webhook Error: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }

  private async handleSuccessfulPayment(
    session: Stripe.Checkout.Session,
    bookingId: string,
  ) {
    const bookinggId = session.metadata?.bookingId;
    if (!bookingId) {
      console.error('Booking ID not found in session metadata');
      return;
    }
    const pendingBooking = await this.pendingBookingModel.findOne({
      bookingId: bookinggId,
    });
    try {
      if (!pendingBooking) {
        console.error(`Pending booking not found for ID ${bookingId}`);
        return;
      }

      await this.updateRoomAvailability(
        pendingBooking.hotelId,
        pendingBooking.roomId,
        pendingBooking.checkIn,
        pendingBooking.checkOut,
        pendingBooking.rooms,
      );

      const completedBooking = new this.completedBookingModel(
        pendingBooking.toObject(),
      );
      completedBooking.status = 'completed';

      await completedBooking.save();
      await this.pendingBookingModel.findByIdAndDelete(pendingBooking._id);
    } catch (error) {
      console.error(
        `Error processing payment for booking ID ${bookingId}:`,
        error,
      );
    }
  }
}
