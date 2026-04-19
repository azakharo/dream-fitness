import { JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';

export class AuthHelper {
  constructor(private app: INestApplication) {}

  private jwtService: JwtService;

  private getJwtService(): JwtService {
    if (!this.jwtService) {
      this.jwtService = this.app.get<JwtService>(JwtService);
    }
    return this.jwtService;
  }

  private generateToken(userId: string, email: string, role: string): string {
    return this.getJwtService().sign(
      {
        sub: userId,
        email,
        role,
      },
      {
        secret: process.env.JWT_SECRET || 'test-jwt-secret-key-for-e2e-tests',
      },
    );
  }

  getUserToken(userId: string, email: string): string {
    return this.generateToken(userId, email, 'user');
  }

  getAdminToken(userId: string, email: string): string {
    return this.generateToken(userId, email, 'admin');
  }
}
