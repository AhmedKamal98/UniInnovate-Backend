import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlatformService {
  constructor(private prisma: PrismaService) {}

  async getHealthStatus() {
    return this.prisma.platformServiceStatus.findMany({ orderBy: { name: 'asc' } });
  }
}
