import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompletedBooking } from 'src/user/schema/completedBookings.schema';
import { PendingBooking } from 'src/user/schema/pendingBooking.schema';
import Stripe from 'stripe';

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
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2024-06-20',
      },
    );
  }

  async createCheckoutSession(
    bookingId: string,
    amount: number,
    currency: string,
  ): Promise<any> {
    try {
      const pendingBooking = await this.pendingBookingModel.findById(bookingId);
      if (!pendingBooking) {
        throw new BadRequestException('Pending booking not found');
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
      this.logger.error(`Error creating checkout session: ${error.message}`);
      throw new Error(`Error creating checkout session: ${error.message}`);
    }
  }

  async handleWebhookEvent(signature: string, payload: Buffer): Promise<void> {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

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
        console.log('type of ', typeof bookingId);
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
    const pendingBooking = await this.pendingBookingModel.findById(bookinggId);
    try {
      if (!pendingBooking) {
        console.error(`Pending booking not found for ID ${bookingId}`);
        return;
      }
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
