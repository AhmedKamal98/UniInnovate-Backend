import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MentorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { available?: boolean; expertise?: string }) {
    const where: any = {};
    if (query.available !== undefined) where.available = query.available;
    if (query.expertise) where.expertise = { has: query.expertise };

    return this.prisma.mentor.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, department: true } } },
    });
  }

  async findById(id: string) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, department: true } }, projects: true },
    });
    if (!mentor) throw new NotFoundException('Mentor not found');
    return mentor;
  }

  async create(data: { userId: string; expertise: string[] }) {
    return this.prisma.mentor.create({ data: { id: uuid(), ...data } });
  }

  async update(id: string, data: Partial<{ expertise: string[]; available: boolean; workload: number }>) {
    return this.prisma.mentor.update({ where: { id }, data });
  }

  async assignToProject(mentorId: string, projectId: string) {
    const assignment = await this.prisma.mentorAssignment.create({
      data: { id: uuid(), mentorId, projectId },
    });

    await this.prisma.mentor.update({
      where: { id: mentorId },
      data: { assignedProjects: { increment: 1 } },
    });

    return assignment;
  }
}
