import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';
import { BaseExceptionFilter, HttpContext } from '@app/shared';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export class ProxyExceptionFilter extends BaseExceptionFilter {
  protected handleHttpException(
    exception: HttpException,
    context: HttpContext,
  ): void {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const detail =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as ProblemDetails).detail || exception.message;

    this.sendProblemDetails(context, status, detail);
  }

  protected handleAxiosError(
    exception: AxiosError,
    context: HttpContext,
  ): void {
    const status = exception.response?.status || HttpStatus.SERVICE_UNAVAILABLE;
    const data = exception.response?.data as ProblemDetails | undefined;
    const detail = data?.detail || exception.message;

    this.sendProblemDetails(context, status, detail);
  }

  protected handleUnknownError(exception: unknown, context: HttpContext): void {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const detail = 'Internal server error';

    this.sendProblemDetails(context, status, detail);
  }

  private sendProblemDetails(
    context: HttpContext,
    status: number,
    detail: string,
  ): void {
    const problemDetails: ProblemDetails = {
      type: `https://httpstatuses.com/${status}`,
      title: this.getStatusTitle(status),
      status,
      detail,
      instance: context.request.url,
    };

    context.response.status(status).json(problemDetails);
  }
}
