import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      userId: payload.sub,
      roles: payload.roles,
    };
  }
}
