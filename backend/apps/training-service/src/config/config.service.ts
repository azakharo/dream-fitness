import { Injectable, Inject } from '@nestjs/common';

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
    @Inject('DATABASE_CONFIG') private readonly dbConfig: DatabaseConfig,
  ) {}

  getDatabaseConfig(): DatabaseConfig {
    return this.dbConfig;
  }
}
