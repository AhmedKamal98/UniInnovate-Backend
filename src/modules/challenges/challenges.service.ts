import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma, EntityStatus, Priority } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: EntityStatus; priority?: Priority; companyId?: string }) {
    const where: Prisma.ChallengeWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.companyId) where.companyId = query.companyId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.challenge.findMany({
        where,
        include: { company: { select: { id: true, name: true } } },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: query.order },
      }),
      this.prisma.challenge.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findById(id: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: { company: true, assignedReviewer: { select: { id: true, name: true } } },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');
    return challenge;
  }

  async create(data: { companyId: string; title: string; industry: string; budget: number; summary: string; priority?: Priority }) {
    return this.prisma.challenge.create({
      data: {
        id: uuid(),
        ...data,
        status: 'DRAFT',
        priority: data.priority || 'MEDIUM',
      },
    });
  }

  async update(id: string, data: Partial<{ title: string; industry: string; budget: number; summary: string; priority: Priority }>) {
    return this.prisma.challenge.update({ where: { id }, data });
  }

  async submit(id: string) {
    const challenge = await this.findById(id);
    if (challenge.status !== 'DRAFT') {
      throw new ConflictException('Challenge can only be submitted from draft status');
    }
    return this.prisma.challenge.update({
      where: { id },
      data: { status: 'PENDING', submittedAt: new Date() },
    });
  }

  async assignReviewer(id: string, reviewerId: string) {
    return this.prisma.challenge.update({
      where: { id },
      data: { assignedReviewerId: reviewerId, status: 'UNDER_REVIEW' },
    });
  }

  async approve(id: string) {
    return this.transition(id, ['UNDER_REVIEW'], 'APPROVED');
  }

  async reject(id: string) {
    return this.transition(id, ['UNDER_REVIEW'], 'REJECTED');
  }

  async requestInfo(id: string, message: string) {
    const challenge = await this.findById(id);
    if (challenge.status !== 'UNDER_REVIEW') {
      throw new ConflictException('Can only request info during review');
    }
    return this.prisma.challenge.update({
      where: { id },
      data: { status: 'PENDING', requestedInfo: message },
    });
  }

  private async transition(id: string, validFrom: EntityStatus[], to: EntityStatus) {
    const challenge = await this.findById(id);
    if (!validFrom.includes(challenge.status)) {
      throw new ConflictException(`Invalid transition from ${challenge.status} to ${to}`);
    }
    return this.prisma.challenge.update({ where: { id }, data: { status: to } });
  }
}
