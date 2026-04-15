import request from 'supertest';
import { Response } from 'supertest';

export type TestResponse<T> = Omit<Response, 'body'> & {
  body: T;
};

import {
  WeekScheduleResponseDto,
  TrainerScheduleResponseDto,
} from '../../src/schedule/dto';

export class ScheduleHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  // Get weekly schedule (optionally pass date query param)
  async getWeekSchedule(
    token: string,
    date?: string,
  ): Promise<TestResponse<WeekScheduleResponseDto>> {
    const url = date ? `/schedule/week?date=${date}` : '/schedule/week';
    const response = await this.request
      .get(url)
      .set('Authorization', `Bearer ${token}`);
    return response as unknown as TestResponse<WeekScheduleResponseDto>;
  }

  // Get trainer schedule (optionally pass dateFrom and dateTo query params)
  async getTrainerSchedule(
    token: string,
    trainerId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<TestResponse<TrainerScheduleResponseDto>> {
    let url = `/schedule/trainer/${trainerId}`;
    const params: string[] = [];
    if (dateFrom) params.push(`dateFrom=${dateFrom}`);
    if (dateTo) params.push(`dateTo=${dateTo}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const response = await this.request
      .get(url)
      .set('Authorization', `Bearer ${token}`);
    return response as unknown as TestResponse<TrainerScheduleResponseDto>;
  }
}
