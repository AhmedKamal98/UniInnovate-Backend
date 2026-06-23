import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, EntityStatus, PlanTier } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: EntityStatus; plan?: PlanTier }) {
    const where: Prisma.TenantWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.plan) where.plan = query.plan;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({ where, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { createdAt: query.order } }),
      this.prisma.tenant.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(data: { name: string; country: string; city: string; plan?: PlanTier; brandingColor?: string; adminUserId?: string }) {
    return this.prisma.tenant.create({
      data: { id: uuid(), ...data, plan: data.plan || 'STARTER' },
    });
  }

  async update(id: string, data: Partial<{ name: string; country: string; city: string; plan: PlanTier; brandingColor: string }>) {
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: EntityStatus) {
    return this.prisma.tenant.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    return this.prisma.tenant.update({ where: { id }, data: { status: 'SUSPENDED' } });
  }
}
