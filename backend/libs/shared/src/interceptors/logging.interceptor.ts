import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging interceptor that logs request details and response time
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const { statusCode } = response;
        const contentLength = response.get('content-length');

        // Skip logging for health check endpoints that return successful responses
        const isHealthCheck = method === 'GET' && url === '/health';
        if (isHealthCheck && statusCode >= 200 && statusCode < 400) {
          return;
        }

        this.logger.log(
          `${method} ${url} ${statusCode} ${contentLength || 0} - ${Date.now() - now}ms - ${ip} - ${userAgent}`,
        );
      }),
    );
  }
}
