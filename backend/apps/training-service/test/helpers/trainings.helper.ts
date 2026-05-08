import request from 'supertest';
import { Response } from 'supertest';
import { CreateTrainingDto } from '../../src/trainings/dto/create-training.dto';
import { UpdateTrainingDto } from '../../src/trainings/dto/update-training.dto';
import { TrainingListResponseDto, TrainingResponseDto } from '@app/contracts';

export type TestResponse<T> = Omit<Response, 'body'> & {
  body: T;
};

export class TrainingsHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  async create(
    headers: Record<string, string>,
    data: CreateTrainingDto,
  ): Promise<TestResponse<TrainingResponseDto>> {
    const response = await this.request
      .post('/trainings')
      .set(headers)
      .send(data);
    return response as unknown as TestResponse<TrainingResponseDto>;
  }

  async findAll(
    headers: Record<string, string>,
    query?: {
      type?: string;
      trainerId?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<TestResponse<TrainingListResponseDto>> {
    const response = await this.request
      .get('/trainings')
      .set(headers)
      .query(query || {});
    return response as unknown as TestResponse<TrainingListResponseDto>;
  }

  async findById(
    headers: Record<string, string>,
    id: string,
  ): Promise<TestResponse<TrainingResponseDto>> {
    const response = await this.request.get(`/trainings/${id}`).set(headers);
    return response as unknown as TestResponse<TrainingResponseDto>;
  }

  async getAvailability(
    headers: Record<string, string>,
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
      .set(headers);
    return response as unknown as TestResponse<{
      trainingId: string;
      capacity: number;
      currentParticipants: number;
      availableSlots: number;
      isAvailable: boolean;
    }>;
  }

  async update(
    headers: Record<string, string>,
    id: string,
    data: UpdateTrainingDto,
  ): Promise<TestResponse<TrainingResponseDto>> {
    const response = await this.request
      .patch(`/trainings/${id}`)
      .set(headers)
      .send(data);
    return response as unknown as TestResponse<TrainingResponseDto>;
  }

  async cancel(
    headers: Record<string, string>,
    id: string,
  ): Promise<TestResponse<TrainingResponseDto>> {
    const response = await this.request.delete(`/trainings/${id}`).set(headers);
    return response as unknown as TestResponse<TrainingResponseDto>;
  }
}
