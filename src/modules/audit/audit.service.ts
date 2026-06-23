import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { module?: string; actorUserId?: string; tenantId?: string; from?: string; to?: string }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (query.module) where.module = query.module;
    if (query.actorUserId) where.actorUserId = query.actorUserId;
    if (query.tenantId) where.tenantId = query.tenantId;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, name: true, email: true } } },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findById(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: { actor: { select: { id: true, name: true, email: true } } },
    });
  }
}
