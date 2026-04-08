import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ConfigService {
  constructor(@Inject('JWT_CONFIG') private readonly jwtConfig: any) {}

  get(key: string): any {
    if (key === 'JWT_SECRET') {
      return this.jwtConfig.secret;
    }
    if (key === 'JWT_ACCESS_TTL') {
      return this.jwtConfig.accessTokenTtl;
    }
    if (key === 'JWT_REFRESH_TTL') {
      return this.jwtConfig.refreshTokenTtl;
    }
    return undefined;
  }
}
