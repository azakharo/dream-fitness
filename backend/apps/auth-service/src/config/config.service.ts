import { Injectable, Inject } from '@nestjs/common';

interface JwtConfig {
  JWT_SECRET: string;
  JWT_ACCESS_TTL: string;
  JWT_REFRESH_TTL: string;
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
      return this.jwtConfig.JWT_SECRET;
    }
    if (key === 'JWT_ACCESS_TTL') {
      return this.jwtConfig.JWT_ACCESS_TTL;
    }
    if (key === 'JWT_REFRESH_TTL') {
      return this.jwtConfig.JWT_REFRESH_TTL;
    }
    return '';
  }

  getDatabaseConfig(): DatabaseConfig {
    return this.dbConfig;
  }
}
