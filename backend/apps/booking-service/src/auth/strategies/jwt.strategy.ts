import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '../../config';
import { Request } from 'express';
import { JwtPayload } from '@app/shared/interfaces';

/**
 * Lightweight JWT Strategy for standalone testing
 * Validates JWT signature and extracts payload WITHOUT database lookup
 * This is a temporary solution until API Gateway is implemented
 */
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
      secretOrKey:
        configService.get('JWT_SECRET') ||
        'your-super-secret-jwt-key-change-in-production',
    });
  }

  validate(payload: JwtPayload) {
    // Return the decoded payload directly
    // No database lookup - this is sufficient for standalone testing
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
