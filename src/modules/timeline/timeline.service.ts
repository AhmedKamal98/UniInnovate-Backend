import { Injectable } from '@nestjs/common';
import { EntityStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.timelineEvent.findMany({
      where: { entityType, entityId },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { entityType: string; entityId: string; authorId: string; title: string; description?: string; statusSnapshot?: EntityStatus }) {
    return this.prisma.timelineEvent.create({
      data: { id: uuid(), ...data },
    });
  }
}
