import { Injectable, Inject } from '@nestjs/common';

interface JwtConfig {
  secret: string;
  accessTokenTtl: string;
  refreshTokenTtl: string;
}

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

@Injectable()
export class ConfigService {
  constructor(
    @Inject('JWT_CONFIG') private readonly jwtConfig: JwtConfig,
    @Inject('DATABASE_CONFIG') private readonly dbConfig: DatabaseConfig,
  ) {}

  get(key: string): string {
    if (key === 'JWT_SECRET') {
      return this.jwtConfig.secret;
    }
    if (key === 'JWT_ACCESS_TTL') {
      return this.jwtConfig.accessTokenTtl;
    }
    if (key === 'JWT_REFRESH_TTL') {
      return this.jwtConfig.refreshTokenTtl;
    }
    return '';
  }

  getDatabaseConfig(): DatabaseConfig {
    return this.dbConfig;
  }
}
