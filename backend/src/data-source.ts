import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// Determine environment-specific file based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFiles = ['.env', `.env.${nodeEnv}`];

// Load both files - later files override earlier ones
dotenv.config({ path: envFiles });
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'dreamfitness',
  password: process.env.DATABASE_PASSWORD || 'dreamfitness123',
  database: process.env.DATABASE_NAME || 'dreamfitness',
  entities: [
    __dirname + '/**/*.entity{.ts,.js}',
    __dirname + '/../apps/**/*.entity{.ts,.js}',
    __dirname + '/../libs/**/*.entity{.ts,.js}',
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

export default new DataSource(dataSourceOptions);
