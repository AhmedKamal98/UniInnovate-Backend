import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma, EntityStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { opportunityId?: string; status?: EntityStatus }) {
    const where: Prisma.ProposalWhereInput = {};
    if (query.opportunityId) where.opportunityId = query.opportunityId;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { teamName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.proposal.findMany({
        where,
        include: { opportunity: { select: { id: true, title: true } } },
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: query.order },
      }),
      this.prisma.proposal.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findById(id: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: { opportunity: true },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  async create(data: {
    opportunityId: string;
    universityId: string;
    title: string;
    teamName: string;
    budgetEstimate?: number;
  }) {
    return this.prisma.proposal.create({
      data: { id: uuid(), ...data, status: 'DRAFT', submittedAt: new Date() },
    });
  }

  async submit(id: string) {
    return this.transition(id, ['DRAFT'], 'PENDING');
  }

  async approve(id: string) {
    return this.transition(id, ['UNDER_REVIEW'], 'APPROVED');
  }

  async reject(id: string) {
    return this.transition(id, ['UNDER_REVIEW'], 'REJECTED');
  }

  async requestRevision(id: string) {
    return this.transition(id, ['PENDING', 'UNDER_REVIEW'], 'UNDER_REVIEW');
  }

  async sendToCompany(id: string) {
    return this.prisma.proposal.update({
      where: { id },
      data: { companyValidationStatus: 'sent', status: 'UNDER_REVIEW' },
    });
  }

  async selectWinner(id: string, recommendation: string) {
    // Reset all proposals for the same opportunity, then mark winner
    const proposal = await this.findById(id);
    await this.prisma.proposal.updateMany({
      where: { opportunityId: proposal.opportunityId },
      data: { selectedWinner: false },
    });
    return this.prisma.proposal.update({
      where: { id },
      data: { selectedWinner: true, finalRecommendation: recommendation },
    });
  }

  async compare(ids: string[]) {
    return this.prisma.proposal.findMany({
      where: { id: { in: ids } },
      include: { opportunity: { select: { id: true, title: true } } },
    });
  }

  private async transition(id: string, validFrom: EntityStatus[], to: EntityStatus) {
    const proposal = await this.findById(id);
    if (!validFrom.includes(proposal.status)) {
      throw new ConflictException(`Invalid transition from ${proposal.status} to ${to}`);
    }
    return this.prisma.proposal.update({ where: { id }, data: { status: to } });
  }
}
