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
    headers: Record<string, string>,
  ): Promise<TestResponse<BookingResponseDto>> {
    const response = await this.request
      .post('/bookings')
      .set(headers)
      .send({ trainingId });
    return response as unknown as TestResponse<BookingResponseDto>;
  }

  async getBookings(
    headers: Record<string, string>,
    filters?: Record<string, unknown>,
  ): Promise<TestResponse<BookingListResponseDto>> {
    const response = await this.request
      .get('/bookings')
      .set(headers)
      .query(filters || {});
    return response as unknown as TestResponse<BookingListResponseDto>;
  }

  async getBookingById(
    bookingId: string,
    headers: Record<string, string>,
  ): Promise<TestResponse<BookingResponseDto>> {
    const response = await this.request
      .get(`/bookings/${bookingId}`)
      .set(headers);
    return response as unknown as TestResponse<BookingResponseDto>;
  }

  async cancelBooking(
    bookingId: string,
    headers: Record<string, string>,
    reason?: string,
  ): Promise<TestResponse<BookingResponseDto>> {
    const response = await this.request
      .post(`/bookings/${bookingId}/cancel`)
      .set(headers)
      .send({ reason });
    return response as unknown as TestResponse<BookingResponseDto>;
  }
}
