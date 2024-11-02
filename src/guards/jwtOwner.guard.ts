import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { OwnerRepository } from '../hotel-owner/repository/ownerRepository';

@Injectable()
export class JwtOwnerGuard extends AuthGuard('ownerAccessToken') {
  constructor(private readonly _ownerRepository: OwnerRepository) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies ? request.cookies.ownerAccessToken : null;

    if (!token) {
      throw new UnauthorizedException('User Token Not Found');
    }

    try {
      const secretKey = process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secretKey) as {
        ownerId: string;
      };

      const ownerId = new Types.ObjectId(decoded.ownerId);

      const owner = await this._ownerRepository.findJwtOwnerById(ownerId);

      if (!owner) {
        throw new UnauthorizedException('owner not found');
      }
      request.owner = owner;
      return true;
    } catch (error) {
      console.error('JWT Verification Error:', error);
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('owner Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Authentication error');
      }
    }
  }
}
