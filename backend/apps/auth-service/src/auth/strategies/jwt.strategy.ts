import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '../../config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req) => {
        let token = null;
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

  async validate(payload: any) {
    // You can add more validation logic here if needed
    return { id: payload.sub, email: payload.email };
  }
}
