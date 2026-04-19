import request from 'supertest';
import { Response } from 'supertest';
import { BookingResponseDto } from '../../src/bookings/dto/booking-response.dto';
import { BookingListResponseDto } from '../../src/bookings/dto/booking-list-response.dto';

export type TestResponse<T> = Omit<Response, 'body'> & {
  body: T;
};

export class BookingHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  async createBooking(
    trainingId: string,
    token: string,
  ): Promise<TestResponse<BookingResponseDto>> {
    const response = await this.request
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ trainingId });
    return response as unknown as TestResponse<BookingResponseDto>;
  }

  async getBookings(
    token: string,
    filters?: Record<string, unknown>,
  ): Promise<TestResponse<BookingListResponseDto>> {
    const response = await this.request
      .get('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .query(filters || {});
    return response as unknown as TestResponse<BookingListResponseDto>;
  }

  async getBookingById(
    bookingId: string,
    token: string,
  ): Promise<TestResponse<BookingResponseDto>> {
    const response = await this.request
      .get(`/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);
    return response as unknown as TestResponse<BookingResponseDto>;
  }

  async cancelBooking(
    bookingId: string,
    token: string,
    reason?: string,
  ): Promise<TestResponse<BookingResponseDto>> {
    const response = await this.request
      .post(`/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason });
    return response as unknown as TestResponse<BookingResponseDto>;
  }
}
