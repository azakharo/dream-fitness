import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { TransactionResponseDto } from '@app/contracts/auth';

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async reservePoints(
    userId: string,
    userRole: string,
    amount: number,
    bookingId: string,
  ): Promise<TransactionResponseDto> {
    try {
      const url = `${this.configService.getAuthServiceUrl()}/auth/balance/reserve`;
      const body = { userId, amount, bookingId };

      const response = await firstValueFrom(
        this.httpService.post<TransactionResponseDto>(url, body, {
          headers: {
            'X-User-Id': userId,
            'X-User-Role': userRole,
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
        this.logger.error(
          `Failed to reserve points for user ${userId}: ${error.message}`,
          error,
        );
        throw error;
      }
      throw error;
    }
  }

  async releasePoints(
    userId: string,
    userRole: string,
    amount: number,
    bookingId: string,
  ): Promise<TransactionResponseDto> {
    try {
      const url = `${this.configService.getAuthServiceUrl()}/auth/balance/release`;
      const body = { userId, amount, bookingId };

      const response = await firstValueFrom(
        this.httpService.post<TransactionResponseDto>(url, body, {
          headers: {
            'X-User-Id': userId,
            'X-User-Role': userRole,
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
    userRole: string,
    amount: number,
    bookingId: string,
  ): Promise<TransactionResponseDto> {
    try {
      const url = `${this.configService.getAuthServiceUrl()}/auth/balance/refund`;
      const body = { userId, amount, bookingId };

      const response = await firstValueFrom(
        this.httpService.post<TransactionResponseDto>(url, body, {
          headers: {
            'X-User-Id': userId,
            'X-User-Role': userRole,
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

  async getUserEmail(userId: string): Promise<string> {
    try {
      const url = `${this.configService.getAuthServiceUrl()}/auth/users/${userId}/email`;
      const response = await firstValueFrom(
        this.httpService.get<{ email: string }>(url, { timeout: 3000 }),
      );
      return response.data.email;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Failed to get email for user ${userId}: ${error.message}`,
          error,
        );
        throw new ServiceUnavailableException('Auth service unavailable');
      }
      throw error;
    }
  }

  async getUserName(userId: string): Promise<string> {
    try {
      const url = `${this.configService.getAuthServiceUrl()}/auth/users/${userId}/name`;
      const response = await firstValueFrom(
        this.httpService.get<{ name: string }>(url, { timeout: 3000 }),
      );
      return response.data.name;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Failed to get name for user ${userId}: ${error.message}`,
        );
        throw new ServiceUnavailableException('Auth service unavailable');
      }
      throw error;
    }
  }
}
