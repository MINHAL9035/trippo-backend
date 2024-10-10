import { Controller, Post, Body, Req, Headers, HttpCode } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('payment')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout-session')
  async createCheckoutSession(@Body() body: any) {
    const { bookingId, amount, currency } = body;
    return this.stripeService.createCheckoutSession(
      bookingId,
      amount,
      currency,
    );
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    if (!req.rawBody) {
      console.error('No raw body found');
      return { received: false };
    }

    try {
      await this.stripeService.handleWebhookEvent(signature, req.rawBody);
      return { received: true };
    } catch (err) {
      console.error('Error processing webhook:', err);
      return { received: false };
    }
  }
}
