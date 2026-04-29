import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';
import { ConfigService } from '../config';
import type { RequestWithUser } from '@app/shared';

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async proxyRequest(
    req: Request,
    body: unknown,
    path: string,
    method: string,
    serviceUrlKey: string,
    defaultUrl: string,
  ): Promise<unknown> {
    const baseUrl = this.configService.get<string>(serviceUrlKey) || defaultUrl;
    const url = `${baseUrl}${path}`;

    const headers = this.buildHeaders(req as RequestWithUser);

    const requestConfig: {
      method: string;
      url: string;
      headers: Record<string, string>;
      data?: unknown;
      params: typeof req.query;
    } = {
      method,
      url,
      headers,
      params: req.query,
    };

    if (body !== null && body !== undefined) {
      requestConfig.data = body;
    }

    const response = await this.httpService.axiosRef.request(requestConfig);
    return response.data;
  }

  buildHeaders(req: RequestWithUser): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (req.user) {
      headers['X-User-Id'] = req.user.id;
      headers['X-User-Role'] = req.user.role;
    }

    return headers;
  }
}
