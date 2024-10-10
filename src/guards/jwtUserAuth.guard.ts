import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { LoginRepository } from '../auth/repository/login.repository';
import { Types } from 'mongoose';

@Injectable()
export class JwtUserGuard extends AuthGuard('userAccessToken') {
  constructor(private readonly _loginRepository: LoginRepository) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies ? request.cookies.userAccessToken : null;

    if (!token) {
      throw new UnauthorizedException('User Token Not Found');
    }

    try {
      const secretKey = process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secretKey) as {
        userId: string;
        role: string;
      };

      const userId = new Types.ObjectId(decoded.userId);
      console.log('user', userId);

      const user = await this._loginRepository.findJwtUserById(userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user && user.is_blocked) {
        throw new UnauthorizedException('User is blocked');
      }

      if (user.role !== decoded.role) {
        throw new UnauthorizedException('Invalid role');
      }

      request.user = user;
      return true;
    } catch (error) {
      console.error('JWT Verification Error:', error);
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('User Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      } else if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new UnauthorizedException('Authentication error');
      }
    }
  }
}
