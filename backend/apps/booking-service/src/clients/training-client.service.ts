import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@app/config';
import { firstValueFrom, AxiosError } from 'axios';
import { TrainingResponseDto } from '@app/training/trainings/dto/training-response.dto';

export interface AvailabilityResponse {
  trainingId: string;
  capacity: number;
  currentParticipants: number;
  availableSlots: number;
  isAvailable: boolean;
}

@Injectable()
export class TrainingClientService {
  private readonly logger = new Logger(TrainingClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getTraining(trainingId: string): Promise<TrainingResponseDto> {
    try {
      const url = `${this.configService.getTrainingServiceUrl()}/trainings/${trainingId}`;

      const response = await firstValueFrom(
        this.httpService.get<TrainingResponseDto>(url, {
          timeout: 5000,
        }),
      );

      this.logger.log(`Successfully fetched training ${trainingId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException('Training not found');
        }
        this.logger.error(
          `Failed to fetch training ${trainingId}: ${error.message}`,
          error,
        );
        throw new ServiceUnavailableException('Training service unavailable');
      }
      throw error;
    }
  }

  async getAvailability(trainingId: string): Promise<AvailabilityResponse> {
    try {
      const url = `${this.configService.getTrainingServiceUrl()}/trainings/${trainingId}/availability`;

      const response = await firstValueFrom(
        this.httpService.get<AvailabilityResponse>(url, {
          timeout: 5000,
        }),
      );

      this.logger.log(
        `Successfully fetched availability for training ${trainingId}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException('Training not found');
        }
        this.logger.error(
          `Failed to fetch availability for training ${trainingId}: ${error.message}`,
          error,
        );
        throw new ServiceUnavailableException('Training service unavailable');
      }
      throw error;
    }
  }
}
