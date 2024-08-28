import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { LoginRepository } from '../auth/repository/login.repository';

@Injectable()
export class JwtUserGuard extends AuthGuard('userAccessToken') {
  constructor(private readonly _loginRepository: LoginRepository) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies ? request.cookies.userAccessToken : null;
    console.log('token', token);

    if (!token) {
      throw new UnauthorizedException('User Token Not Found');
    }

    try {
      const secretKey = process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secretKey) as {
        userId: string;
        role: string;
      };

      const user = await this._loginRepository.findJwtUserById(decoded.userId);
      console.log('user');
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.role !== decoded.role) {
        throw new UnauthorizedException('Invalid role');
      }

      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('User Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Authentication error');
      }
    }
  }
}
