import request from 'supertest';
import { Response } from 'supertest';
import { CreateTrainingDto } from '../../src/trainings/dto/create-training.dto';
import { UpdateTrainingDto } from '../../src/trainings/dto/update-training.dto';
import { TrainingResponseDto } from '@app/contracts';

export type TestResponse<T> = Omit<Response, 'body'> & {
  body: T;
};

export class TrainingsHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  async create(
    token: string,
    data: CreateTrainingDto,
  ): Promise<TestResponse<TrainingResponseDto>> {
    const response = await this.request
      .post('/trainings')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    return response as unknown as TestResponse<TrainingResponseDto>;
  }

  async findAll(
    token: string,
    query?: {
      type?: string;
      trainerId?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<TestResponse<{ data: TrainingResponseDto[]; total: number }>> {
    const response = await this.request
      .get('/trainings')
      .set('Authorization', `Bearer ${token}`)
      .query(query || {});
    return response as unknown as TestResponse<{
      data: TrainingResponseDto[];
      total: number;
    }>;
  }

  async findById(
    token: string,
    id: string,
  ): Promise<TestResponse<TrainingResponseDto>> {
    const response = await this.request
      .get(`/trainings/${id}`)
      .set('Authorization', `Bearer ${token}`);
    return response as unknown as TestResponse<TrainingResponseDto>;
  }

  async getAvailability(
    token: string,
    id: string,
  ): Promise<
    TestResponse<{
      trainingId: string;
      capacity: number;
      currentParticipants: number;
      availableSlots: number;
      isAvailable: boolean;
    }>
  > {
    const response = await this.request
      .get(`/trainings/${id}/availability`)
      .set('Authorization', `Bearer ${token}`);
    return response as unknown as TestResponse<{
      trainingId: string;
      capacity: number;
      currentParticipants: number;
      availableSlots: number;
      isAvailable: boolean;
    }>;
  }

  async update(
    token: string,
    id: string,
    data: UpdateTrainingDto,
  ): Promise<TestResponse<TrainingResponseDto>> {
    const response = await this.request
      .patch(`/trainings/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    return response as unknown as TestResponse<TrainingResponseDto>;
  }

  async cancel(
    token: string,
    id: string,
  ): Promise<TestResponse<TrainingResponseDto>> {
    const response = await this.request
      .delete(`/trainings/${id}`)
      .set('Authorization', `Bearer ${token}`);
    return response as unknown as TestResponse<TrainingResponseDto>;
  }
}
