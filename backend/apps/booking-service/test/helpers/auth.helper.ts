import request from 'supertest';
import { Response } from 'supertest';
import { JwtPayload } from '@app/shared/interfaces';
import { UserRole } from '@app/shared/enums';
import jwt from 'jsonwebtoken';

export type TestResponse<T> = Omit<Response, 'body'> & {
  body: T;
};

export class AuthHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  generateToken(userId: string, email: string, role: UserRole): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };
    const secret = process.env.JWT_SECRET || 'test-secret';
    const token = jwt.sign(payload, secret, {
      expiresIn: '1h',
    });
    return token;
  }
}
