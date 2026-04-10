import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '../../config';
import { Request } from 'express';
import { JwtPayload } from '@app/shared/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
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

  async validate(payload: JwtPayload): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      return null;
    }
    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      return null;
    }
    // Check if role matches payload
    if (user.role !== payload.role) {
      return null;
    }
    return user;
  }
}
