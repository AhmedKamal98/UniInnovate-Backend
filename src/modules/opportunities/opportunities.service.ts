import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma, EntityStatus, Visibility } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: EntityStatus; visibility?: Visibility }) {
    const where: Prisma.OpportunityWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.visibility) where.visibility = query.visibility;
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        include: { challenge: { select: { id: true, title: true, companyId: true } } },
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: query.order },
      }),
      this.prisma.opportunity.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findById(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: { challenge: true, mentor: true },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    return opportunity;
  }

  async create(data: {
    challengeId: string;
    title: string;
    requiredSkills: string[];
    deadline?: Date;
    ndaRequired?: boolean;
    visibility?: Visibility;
    mentorId?: string;
  }) {
    return this.prisma.opportunity.create({
      data: { id: uuid(), ...data, status: 'DRAFT' },
    });
  }

  async update(id: string, data: Partial<{ title: string; requiredSkills: string[]; deadline: Date; visibility: Visibility; mentorId: string }>) {
    return this.prisma.opportunity.update({ where: { id }, data });
  }

  async publish(id: string) {
    const opp = await this.findById(id);
    if (opp.status !== 'DRAFT') throw new ConflictException('Can only publish from draft');
    return this.prisma.opportunity.update({ where: { id }, data: { status: 'PUBLISHED' } });
  }
}
