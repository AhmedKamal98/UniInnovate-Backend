import { Injectable } from '@nestjs/common';
import { Role, Severity } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findForUser(userId: string, role: Role, tenantId: string | null, read?: boolean) {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { targetUserId: userId },
          { targetRole: role, tenantId },
          { targetRole: null, targetUserId: null, tenantId },
          { targetRole: null, targetUserId: null, tenantId: null },
        ],
        ...(read !== undefined ? { read } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllRead(userId: string, role: Role, tenantId: string | null) {
    await this.prisma.notification.updateMany({
      where: {
        OR: [
          { targetUserId: userId },
          { targetRole: role, tenantId },
          { targetRole: null, targetUserId: null },
        ],
        read: false,
      },
      data: { read: true },
    });
  }

  async create(data: { tenantId?: string; targetUserId?: string; targetRole?: Role; title: string; body: string; severity?: Severity }) {
    return this.prisma.notification.create({
      data: { id: uuid(), ...data, severity: data.severity || 'INFO' },
    });
  }
}
