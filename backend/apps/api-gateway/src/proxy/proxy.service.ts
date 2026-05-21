import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request, Response } from 'express';
import { ConfigService } from '../config';
import type { RequestWithUser } from '@app/shared';

export interface ProxyResponse<T = unknown> {
  data: T;
  headers: Record<string, string | string[]>;
}

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Proxies a request and returns only the response data.
   * Use this for most proxy operations.
   */
  async proxyRequest<T = unknown>(
    req: Request,
    body: unknown,
    path: string,
    method: string,
    serviceUrlKey: string,
    defaultUrl: string,
  ): Promise<T> {
    const proxyResponse = await this.proxyRequestWithHeaders<T>(
      req,
      body,
      path,
      method,
      serviceUrlKey,
      defaultUrl,
    );
    return proxyResponse.data;
  }

  /**
   * Proxies a request and returns both data and headers.
   * Use this when you need access to response headers (e.g., for cookie forwarding).
   */
  async proxyRequestWithHeaders<T = unknown>(
    req: Request,
    body: unknown,
    path: string,
    method: string,
    serviceUrlKey: string,
    defaultUrl: string,
  ): Promise<ProxyResponse<T>> {
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

    const responseHeaders: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(response.headers)) {
      if (value !== undefined) {
        responseHeaders[key] = value as string | string[];
      }
    }

    return {
      data: response.data as T,
      headers: responseHeaders,
    };
  }

  buildHeaders(req: RequestWithUser): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (req.user) {
      headers['X-User-Id'] = req.user.id;
      headers['X-User-Role'] = req.user.role;
    }

    // Forward cookies to downstream services
    if (req.cookies && Object.keys(req.cookies).length > 0) {
      const cookieString = Object.entries(req.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
      headers['Cookie'] = cookieString;
    }

    return headers;
  }

  /**
   * Forwards Set-Cookie header from auth-service response to the client
   */
  forwardSetCookieHeader(
    authResponse: ProxyResponse<unknown>,
    res: Response,
  ): void {
    const setCookie = authResponse.headers['set-cookie'];
    if (setCookie) {
      if (Array.isArray(setCookie)) {
        setCookie.forEach((cookie) => res.append('Set-Cookie', cookie));
      } else {
        res.append('Set-Cookie', setCookie);
      }
    }
  }
}
