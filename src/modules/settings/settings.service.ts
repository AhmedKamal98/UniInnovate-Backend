import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getTheme(tenantId: string) {
    const theme = await this.prisma.themeSettings.findUnique({ where: { tenantId } });
    if (!theme) throw new NotFoundException('Theme settings not found');
    return theme;
  }

  async saveTheme(tenantId: string, data: {
    mode?: string; primaryColor?: string; secondaryColor?: string; accentColor?: string;
    radius?: number; fontFamily?: string; sidebarStyle?: string; headerStyle?: string;
    logoUrl?: string; tenantName?: string;
  }) {
    return this.prisma.themeSettings.upsert({
      where: { tenantId },
      update: data,
      create: { id: uuid(), tenantId, tenantName: data.tenantName || 'TTO Platform', ...data },
    });
  }

  async getFeatureFlags() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async updateFeatureFlag(id: string, enabled: boolean) {
    return this.prisma.featureFlag.update({ where: { id }, data: { enabled } });
  }
}
