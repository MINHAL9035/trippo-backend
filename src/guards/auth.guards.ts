import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private _jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.cookies['usersAccessToken'];
    if (!token) {
      throw new UnauthorizedException('No access token found in cookies');
    }
    try {
      const payload = this._jwtService.verify(token);
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    return true;
  }
}
