import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma, Role, EntityStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: EntityStatus; role?: Role; tenantId?: string }) {
    const where: Prisma.UserWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.tenantId) where.tenantId = query.tenantId;
    if (query.role) where.roles = { some: { role: query.role } };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { roles: true },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: query.order },
      }),
      this.prisma.user.count({ where }),
    ]);

    const sanitized = data.map(({ passwordHash, ...user }) => ({
      ...user,
      roles: user.roles.map((r) => r.role),
    }));

    return paginate(sanitized, total, query.page, query.limit);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, ...rest } = user;
    return { ...rest, roles: user.roles.map((r) => r.role) };
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    roles: Role[];
    primaryRole: Role;
    tenantId?: string;
    companyId?: string;
    department?: string;
    title?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const id = uuid();

    const user = await this.prisma.user.create({
      data: {
        id,
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        primaryRole: data.primaryRole,
        tenantId: data.tenantId,
        companyId: data.companyId,
        department: data.department,
        title: data.title,
        status: 'PENDING',
        roles: {
          create: data.roles.map((role) => ({ id: uuid(), role })),
        },
      },
      include: { roles: true },
    });

    const { passwordHash: _, ...rest } = user;
    return { ...rest, roles: user.roles.map((r) => r.role) };
  }

  async update(id: string, data: Partial<{ name: string; department: string; title: string; avatarUrl: string }>) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { roles: true },
    });

    const { passwordHash, ...rest } = user;
    return { ...rest, roles: user.roles.map((r) => r.role) };
  }

  async updateStatus(id: string, status: EntityStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }
}
