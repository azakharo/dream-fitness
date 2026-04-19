import request from 'supertest';
import { Response } from 'supertest';
import { WaitlistResponseDto } from '../../src/waitlist/dto/waitlist-response.dto';
import { WaitlistPositionResponseDto } from '../../src/waitlist/dto/waitlist-position-response.dto';

export type TestResponse<T> = Omit<Response, 'body'> & {
  body: T;
};

export class WaitlistHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  async joinWaitlist(
    trainingId: string,
    token: string,
  ): Promise<TestResponse<WaitlistResponseDto>> {
    const response = await this.request
      .post('/waitlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ trainingId });
    return response as unknown as TestResponse<WaitlistResponseDto>;
  }

  async getWaitlistPosition(
    trainingId: string,
    token: string,
  ): Promise<TestResponse<WaitlistPositionResponseDto>> {
    const response = await this.request
      .get('/waitlist/position')
      .set('Authorization', `Bearer ${token}`)
      .query({ trainingId });
    return response as unknown as TestResponse<WaitlistPositionResponseDto>;
  }

  async leaveWaitlist(
    trainingId: string,
    token: string,
  ): Promise<TestResponse<{ message: string }>> {
    const response = await this.request
      .delete('/waitlist')
      .set('Authorization', `Bearer ${token}`)
      .query({ trainingId });
    return response as unknown as TestResponse<{ message: string }>;
  }
}
