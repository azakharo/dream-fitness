import request from 'supertest';
import { Response } from 'supertest';
import { CreateTrainerDto } from '../../src/trainers/dto/create-trainer.dto';
import { UpdateTrainerDto } from '../../src/trainers/dto/update-trainer.dto';
import { TrainerResponseDto } from '../../src/trainers/dto/trainer-response.dto';

export type TestResponse<T> = Omit<Response, 'body'> & {
  body: T;
};

export class TrainersHelper {
  constructor(private request: request.SuperTest<request.Test>) {}

  async create(
    headers: Record<string, string>,
    data: CreateTrainerDto,
  ): Promise<TestResponse<TrainerResponseDto>> {
    const response = await this.request
      .post('/trainers')
      .set(headers)
      .send(data);
    return response as unknown as TestResponse<TrainerResponseDto>;
  }

  async findAll(
    headers: Record<string, string>,
  ): Promise<TestResponse<TrainerResponseDto[]>> {
    const response = await this.request.get('/trainers').set(headers);
    return response as unknown as TestResponse<TrainerResponseDto[]>;
  }

  async findById(
    headers: Record<string, string>,
    id: string,
  ): Promise<TestResponse<TrainerResponseDto>> {
    const response = await this.request.get(`/trainers/${id}`).set(headers);
    return response as unknown as TestResponse<TrainerResponseDto>;
  }

  async update(
    headers: Record<string, string>,
    id: string,
    data: UpdateTrainerDto,
  ): Promise<TestResponse<TrainerResponseDto>> {
    const response = await this.request
      .patch(`/trainers/${id}`)
      .set(headers)
      .send(data);
    return response as unknown as TestResponse<TrainerResponseDto>;
  }

  async remove(
    headers: Record<string, string>,
    id: string,
  ): Promise<TestResponse<void>> {
    const response = await this.request.delete(`/trainers/${id}`).set(headers);
    return response as unknown as TestResponse<void>;
  }
}
