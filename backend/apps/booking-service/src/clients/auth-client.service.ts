import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@app/config';
import { firstValueFrom, AxiosError } from 'axios';
import { TransactionResponseDto } from '@app/auth/balance/dto/transaction-response.dto';

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async reservePoints(
    userId: string,
    amount: number,
    bookingId: string,
  ): Promise<TransactionResponseDto> {
    try {
      const url = `${this.configService.getAuthServiceUrl()}/balance/reserve`;
      const body = { userId, amount, bookingId };

      const response = await firstValueFrom(
        this.httpService.post<TransactionResponseDto>(url, body, {
          headers: {
            'X-User-Id': userId,
          },
          timeout: 5000,
        }),
      );

      this.logger.log(
        `Successfully reserved ${amount} points for user ${userId} in booking ${bookingId}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException('Auth service not found');
        }
        this.logger.error(
          `Failed to reserve points for user ${userId}: ${error.message}`,
          error,
        );
        throw new ServiceUnavailableException('Auth service unavailable');
      }
      throw error;
    }
  }

  async releasePoints(
    userId: string,
    amount: number,
    bookingId: string,
  ): Promise<TransactionResponseDto> {
    try {
      const url = `${this.configService.getAuthServiceUrl()}/balance/release`;
      const body = { userId, amount, bookingId };

      const response = await firstValueFrom(
        this.httpService.post<TransactionResponseDto>(url, body, {
          headers: {
            'X-User-Id': userId,
          },
          timeout: 5000,
        }),
      );

      this.logger.log(
        `Successfully released ${amount} points for user ${userId} in booking ${bookingId}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException('Auth service not found');
        }
        this.logger.error(
          `Failed to release points for user ${userId}: ${error.message}`,
          error,
        );
        throw new ServiceUnavailableException('Auth service unavailable');
      }
      throw error;
    }
  }

  async refundPoints(
    userId: string,
    amount: number,
    bookingId: string,
  ): Promise<TransactionResponseDto> {
    try {
      const url = `${this.configService.getAuthServiceUrl()}/balance/refund`;
      const body = { userId, amount, bookingId };

      const response = await firstValueFrom(
        this.httpService.post<TransactionResponseDto>(url, body, {
          headers: {
            'X-User-Id': userId,
          },
          timeout: 5000,
        }),
      );

      this.logger.log(
        `Successfully refunded ${amount} points for user ${userId} in booking ${bookingId}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException('Auth service not found');
        }
        this.logger.error(
          `Failed to refund points for user ${userId}: ${error.message}`,
          error,
        );
        throw new ServiceUnavailableException('Auth service unavailable');
      }
      throw error;
    }
  }
}
