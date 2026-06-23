import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, EntityStatus, LegalType } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LegalService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { projectId?: string; type?: LegalType; status?: EntityStatus }) {
    const where: Prisma.LegalRecordWhereInput = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    return this.prisma.legalRecord.findMany({
      where,
      include: { project: { select: { id: true, title: true } }, owner: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const record = await this.prisma.legalRecord.findUnique({
      where: { id },
      include: { project: true, owner: true },
    });
    if (!record) throw new NotFoundException('Legal record not found');
    return record;
  }

  async create(data: { projectId: string; ownerId: string; type: LegalType; status?: EntityStatus; dueDate?: Date; notes?: string }) {
    return this.prisma.legalRecord.create({
      data: { id: uuid(), ...data, status: data.status || 'PENDING' },
    });
  }

  async update(id: string, data: Partial<{ status: EntityStatus; notes: string; dueDate: Date }>) {
    return this.prisma.legalRecord.update({ where: { id }, data });
  }

  async upsert(data: { projectId: string; type: LegalType; ownerId: string; status?: EntityStatus; dueDate?: Date; notes?: string }) {
    const existing = await this.prisma.legalRecord.findFirst({
      where: { projectId: data.projectId, type: data.type },
    });

    if (existing) {
      return this.update(existing.id, { status: data.status, notes: data.notes, dueDate: data.dueDate });
    }

    return this.create(data);
  }
}
