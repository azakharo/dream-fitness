import { HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from './base-exception.filter';
import { HttpContext } from './interfaces/http-context.interface';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

/**
 * Global HTTP exception filter that standardizes error responses
 */
export class HttpExceptionFilter extends BaseExceptionFilter {
  protected handleHttpException(
    exception: HttpException,
    context: HttpContext,
  ): void {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let error: string;
    let details: unknown;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = exception.name;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const responseObj = exceptionResponse as Record<string, unknown>;
      message = (responseObj.message as string) || exception.message;
      error = (responseObj.error as string) || exception.name;
      details = responseObj.details;
    } else {
      message = exception.message;
      error = exception.name;
    }

    this.sendErrorResponse(context, status, message, error, details);
  }

  protected handleUnknownError(exception: unknown, context: HttpContext): void {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof Error
        ? 'Internal server error'
        : 'An unexpected error occurred';
    const error = 'Internal Server Error';

    this.sendErrorResponse(context, status, message, error);
  }

  private sendErrorResponse(
    context: HttpContext,
    status: number,
    message: string,
    error: string,
    details?: unknown,
  ): void {
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: context.request.url,
    };

    if (details) {
      errorResponse.details = details;
    }

    context.response.status(status).json(errorResponse);
  }
}
