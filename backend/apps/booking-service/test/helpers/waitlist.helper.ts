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
    headers: Record<string, string>,
  ): Promise<TestResponse<WaitlistResponseDto>> {
    const response = await this.request
      .post('/waitlist')
      .set(headers)
      .send({ trainingId });
    return response as unknown as TestResponse<WaitlistResponseDto>;
  }

  async getWaitlistPosition(
    trainingId: string,
    headers: Record<string, string>,
  ): Promise<TestResponse<WaitlistPositionResponseDto>> {
    const response = await this.request
      .get('/waitlist/position')
      .set(headers)
      .query({ trainingId });
    return response as unknown as TestResponse<WaitlistPositionResponseDto>;
  }

  async leaveWaitlist(
    trainingId: string,
    headers: Record<string, string>,
  ): Promise<TestResponse<{ message: string }>> {
    const response = await this.request
      .delete('/waitlist')
      .set(headers)
      .query({ trainingId });
    return response as unknown as TestResponse<{ message: string }>;
  }
}
