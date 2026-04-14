export interface JwtConfig {
  JWT_SECRET: string;
  JWT_ACCESS_TTL: string;
  JWT_REFRESH_TTL: string;
}

export const jwtConfig: JwtConfig = {
  JWT_SECRET:
    process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || '15m',
  JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL || '7d',
};
