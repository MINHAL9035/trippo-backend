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
export class JwtAdminGuard extends AuthGuard('adminAccessToken') {
  constructor(private readonly _loginRepository: LoginRepository) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies ? request.cookies.adminAccessToken : null;
    if (!token) {
      throw new UnauthorizedException('Admin Token Not Found');
    }

    try {
      const decoded = jwt.decode(token) as { userId: string; role: string };
      const secretKey = process.env.JWT_SECRET;
      jwt.verify(token, secretKey);

      const userId = new Types.ObjectId(decoded.userId);
      const user = await this._loginRepository.findJwtUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.role !== decoded.role) {
        throw new UnauthorizedException('Invalid role');
      }

      request.user = user;
      return true;
    } catch (error) {
      console.error('JWT Verification Error in admin:', error);
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Admin Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid admin token');
      } else {
        throw new UnauthorizedException('Authentication error in admion jwt');
      }
    }
  }
}
