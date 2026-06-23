import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, EntityStatus, ProjectHealth } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: EntityStatus; health?: ProjectHealth; companyId?: string }) {
    const where: Prisma.ProjectWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.health) where.health = query.health;
    if (query.companyId) where.companyId = query.companyId;
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: { company: { select: { id: true, name: true } }, mentor: { select: { id: true, userId: true } } },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: query.order },
      }),
      this.prisma.project.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { company: true, mentor: true, proposal: true, legalRecords: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(data: { proposalId: string; companyId: string; mentorId: string; title: string; dueDate?: Date; opportunityId?: string }) {
    return this.prisma.project.create({
      data: { id: uuid(), ...data, status: 'PENDING', lastActivity: new Date() },
    });
  }

  async update(id: string, data: Partial<{ title: string; status: EntityStatus; health: ProjectHealth; progress: number; nextMilestone: string }>) {
    return this.prisma.project.update({
      where: { id },
      data: { ...data, lastActivity: new Date() },
    });
  }

  async updateProgress(id: string, progress: number, health: ProjectHealth, nextMilestone?: string) {
    const status: EntityStatus = progress >= 100 ? 'COMPLETED' : 'ACTIVE';
    return this.prisma.project.update({
      where: { id },
      data: { progress, health, nextMilestone, status, lastActivity: new Date() },
    });
  }
}
