import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '../config';
import { TrainingBookingCountDto } from '@app/contracts/booking';

@Injectable()
export class BookingClientService {
  private readonly logger = new Logger(BookingClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getBookingCount(trainingId: string): Promise<TrainingBookingCountDto> {
    try {
      const url = `${this.configService.getBookingServiceUrl()}/bookings/training/${trainingId}/count`;

      const response = await firstValueFrom(
        this.httpService.get<TrainingBookingCountDto>(url, {
          timeout: 5000,
        }),
      );

      this.logger.log(
        `Successfully fetched booking count for training ${trainingId}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException('Training not found');
        }
        this.logger.error(
          `Failed to fetch booking count for training ${trainingId}: ${error.message}`,
          error,
        );
        throw new ServiceUnavailableException('Booking service unavailable');
      }
      throw error;
    }
  }
}
