import request from 'supertest';
import { Response } from 'supertest';

export type TestResponse<T> = Omit<Response, 'body'> & {
  body: T;
};

export class BookingHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  async createBooking(
    trainingId: string,
    token: string,
  ): Promise<TestResponse<any>> {
    const response = await this.request
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ trainingId });
    return response as unknown as TestResponse<any>;
  }

  async getBookings(
    token: string,
    filters?: Record<string, any>,
  ): Promise<TestResponse<any>> {
    const response = await this.request
      .get('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .query(filters || {});
    return response as unknown as TestResponse<any>;
  }

  async getBookingById(
    bookingId: string,
    token: string,
  ): Promise<TestResponse<any>> {
    const response = await this.request
      .get(`/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);
    return response as unknown as TestResponse<any>;
  }

  async cancelBooking(
    bookingId: string,
    token: string,
    reason?: string,
  ): Promise<TestResponse<any>> {
    const response = await this.request
      .post(`/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason });
    return response as unknown as TestResponse<any>;
  }
}
