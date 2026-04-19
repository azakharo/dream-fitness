import request from 'supertest';
import { Response } from 'supertest';

export type TestResponse<T> = Omit<Response, 'body'> & {
  body: T;
};

export class WaitlistHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  async joinWaitlist(
    trainingId: string,
    token: string,
  ): Promise<TestResponse<any>> {
    const response = await this.request
      .post('/waitlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ trainingId });
    return response as unknown as TestResponse<any>;
  }

  async getWaitlistPosition(
    trainingId: string,
    token: string,
  ): Promise<TestResponse<any>> {
    const response = await this.request
      .get('/waitlist/position')
      .set('Authorization', `Bearer ${token}`)
      .query({ trainingId });
    return response as unknown as TestResponse<any>;
  }

  async leaveWaitlist(
    trainingId: string,
    token: string,
  ): Promise<TestResponse<any>> {
    const response = await this.request
      .delete('/waitlist')
      .set('Authorization', `Bearer ${token}`)
      .query({ trainingId });
    return response as unknown as TestResponse<any>;
  }
}
