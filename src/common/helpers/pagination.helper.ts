import { PaginatedResponse, PaginationMeta } from '../types';

export function paginate<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T> {
  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
  return { data, meta };
}
