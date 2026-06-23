import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, EntityStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: EntityStatus; flagged?: boolean }) {
    const where: Prisma.CompanyWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.flagged !== undefined) where.flagged = query.flagged;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { industry: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({ where, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { createdAt: query.order } }),
      this.prisma.company.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async create(data: { name: string; industry: string; ownerUserId: string }) {
    return this.prisma.company.create({ data: { id: uuid(), ...data } });
  }

  async update(id: string, data: Partial<{ name: string; industry: string; status: EntityStatus }>) {
    return this.prisma.company.update({ where: { id }, data });
  }

  async flag(id: string, flagged: boolean) {
    return this.prisma.company.update({ where: { id }, data: { flagged } });
  }
}
