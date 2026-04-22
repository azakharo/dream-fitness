import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Response } from 'express';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

@Catch()
export class ProxyExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    if (exception instanceof AxiosError) {
      const status =
        exception.response?.status || HttpStatus.SERVICE_UNAVAILABLE;
      const data = exception.response?.data as ProblemDetails | undefined;

      const problemDetails: ProblemDetails = {
        type: `https://httpstatuses.com/${status}`,
        title: this.getTitle(status),
        status,
        detail: data?.detail || exception.message,
        instance: request.url,
      };

      response.status(status).json(problemDetails);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const problemDetails: ProblemDetails = {
        type: `https://httpstatuses.com/${status}`,
        title: this.getTitle(status),
        status,
        detail:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as ProblemDetails).detail || exception.message,
        instance: request.url,
      };

      response.status(status).json(problemDetails);
      return;
    }

    // Default internal server error
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const problemDetails: ProblemDetails = {
      type: `https://httpstatuses.com/${status}`,
      title: this.getTitle(status),
      status,
      detail: 'Internal server error',
      instance: request.url,
    };

    response.status(status).json(problemDetails);
  }

  private getTitle(status: number): string {
    const titles: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    };
    return titles[status] || 'Error';
  }
}
