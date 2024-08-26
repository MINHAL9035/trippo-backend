import { Module } from '@nestjs/common';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './service/admin.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminLoginRepository } from './respository/admin.repository';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminRefreshTokenSchema } from './schema/adminRefreshToken.schema';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: 'AdminRefreshToken', schema: AdminRefreshTokenSchema },
    ]),
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
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminLoginRepository, JwtService],
})
export class AdminModule {}
