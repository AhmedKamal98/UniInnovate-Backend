import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  activeRole: Role;
  roles: Role[];
  tenantId: string | null;
  companyId: string | null;
  impersonatedBy: string | null;
}

export interface RequestUser {
  id: string;
  email: string;
  activeRole: Role;
  roles: Role[];
  tenantId: string | null;
  companyId: string | null;
  impersonatedBy: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
