import { Request, Response } from 'express';

export interface HttpContext {
  request: Request;
  response: Response;
}
