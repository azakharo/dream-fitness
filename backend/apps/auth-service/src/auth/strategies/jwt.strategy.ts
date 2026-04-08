import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '../../config';
import { Request } from 'express';
import { JwtPayload } from '@app/shared/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        let token: string | null = null;
        if (req.headers.authorization) {
          token = req.headers.authorization.startsWith('Bearer')
            ? req.headers.authorization.slice(7)
            : req.headers.authorization;
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
