import { PaginationParams } from '@app/shared';

export class GetUserBookingsQuery {
  constructor(
    public readonly userId: string,
    public readonly filters?: PaginationParams & {
      status?: string;
      trainingId?: string;
    },
  ) {}
}
