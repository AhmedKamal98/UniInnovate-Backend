import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.fileAttachment.findMany({
      where: { entityType, entityId },
      include: { uploader: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const file = await this.prisma.fileAttachment.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async create(data: {
    entityType: string;
    entityId: string;
    uploadedBy: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
  }) {
    return this.prisma.fileAttachment.create({
      data: { id: uuid(), ...data, sizeBytes: BigInt(data.sizeBytes) },
    });
  }

  async remove(id: string) {
    // In production: also delete from S3
    return this.prisma.fileAttachment.delete({ where: { id } });
  }
}
