import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenSchema } from './schema/refresh.token.schema';
import { LoginRepository } from './repository/login.repository';
import googleOauthConfig from './config/google-oauth.config';
import { User, UserSchema } from '../user/schema/user.schema';
import { ForgotController } from './controller/forgotPassword.controller';
import { ForgotService } from './service/forgot.service';
import { ForgotRepository } from './repository/forgotPassword.repository';
import { OtpService } from '../user/service/otp.service';
import { OtpRepository } from '../user/repository/Otp.repository';

@Module({
  imports: [
    UserModule,
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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: 'RefreshToken', schema: RefreshTokenSchema },
    ]),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController, ForgotController],
  providers: [
    AuthService,
    LoginRepository,
    ForgotService,
    ForgotRepository,
    OtpService,
    OtpRepository,
  ],
  exports: [MongooseModule, LoginRepository],
})
export class AuthModule {}
