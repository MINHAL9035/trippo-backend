import { Controller, Post, Body, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('payment')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout-session')
  async createCheckoutSession(@Body() body: any, @Req() req: any) {
    const { bookingId, amount, currency } = body;
    const origin = req.headers.origin;
    return this.stripeService.createCheckoutSession(
      bookingId,
      amount,
      currency,
      origin,
    );
  }
}
