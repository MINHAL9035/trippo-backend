import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/config/logger.config';
import { TripModule } from './trip/trip.module';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { AwsModule } from './aws/aws.module';
import { HotelOwnerModule } from './hotel-owner/hotel-owner.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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

    // logger
    WinstonModule.forRoot(winstonConfig),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        Logger.log(`Connecting to MongoDB at ${uri}`, 'MongooseModule');
        return { uri };
      },
      inject: [ConfigService],
    }),

    // Mailer configuration
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    AdminModule,
    TripModule,
    AwsModule,
    HotelOwnerModule,
    StripeModule,
  ],
})
export class AppModule {}
