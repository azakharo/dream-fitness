export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Creates a standardized paginated result object
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Normalizes pagination parameters with defaults
 */
export function normalizePaginationParams(params: PaginationParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(Math.max(1, params.limit || 10), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Calculates pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number,
): {
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} {
  const totalPages = Math.ceil(total / limit);

  return {
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
