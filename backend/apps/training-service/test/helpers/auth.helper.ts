import jwt from 'jsonwebtoken';
import { UserRole } from '@app/shared/enums';

export class AuthHelper {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret =
      process.env.JWT_SECRET || 'test-jwt-secret-key-for-e2e-tests';
  }

  generateAdminToken(userId: string): string {
    return jwt.sign(
      {
        sub: userId,
        email: `admin-${userId}@test.com`,
        role: UserRole.ADMIN,
      },
      this.jwtSecret,
      { expiresIn: '15h' },
    );
  }

  generateClientToken(userId: string): string {
    return jwt.sign(
      {
        sub: userId,
        email: `client-${userId}@test.com`,
        role: UserRole.CLIENT,
      },
      this.jwtSecret,
      { expiresIn: '15h' },
    );
  }

  generateExpiredToken(userId: string): string {
    return jwt.sign(
      {
        sub: userId,
        email: `client-${userId}@test.com`,
        role: UserRole.CLIENT,
      },
      this.jwtSecret,
      { expiresIn: '0ms' },
    );
  }
}
