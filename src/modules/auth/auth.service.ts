import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/types';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Account suspended');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const roles = user.roles.map((r) => r.role);
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      activeRole: user.primaryRole,
      roles,
      tenantId: user.tenantId,
      companyId: user.companyId,
      impersonatedBy: null,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        primaryRole: user.primaryRole,
        roles,
        tenantId: user.tenantId,
        companyId: user.companyId,
      },
      activeRole: user.primaryRole,
      availableRoles: roles,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { roles: true },
      });

      if (!user || user.status === 'SUSPENDED') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const roles = user.roles.map((r) => r.role);
      return this.generateTokens({
        sub: user.id,
        email: user.email,
        activeRole: payload.activeRole,
        roles,
        tenantId: user.tenantId,
        companyId: user.companyId,
        impersonatedBy: payload.impersonatedBy,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async switchRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const roles = user.roles.map((r) => r.role);
    if (!roles.includes(role)) {
      throw new ForbiddenException('Role not available');
    }

    return this.generateTokens({
      sub: user.id,
      email: user.email,
      activeRole: role,
      roles,
      tenantId: user.tenantId,
      companyId: user.companyId,
      impersonatedBy: null,
    });
  }

  async impersonate(superAdminId: string, targetUserId: string, role?: Role) {
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: { roles: true },
    });

    if (!target) throw new UnauthorizedException('Target user not found');

    const targetRoles = target.roles.map((r) => r.role);
    const activeRole = role && targetRoles.includes(role) ? role : target.primaryRole;

    return this.generateTokens({
      sub: target.id,
      email: target.email,
      activeRole,
      roles: targetRoles,
      tenantId: target.tenantId,
      companyId: target.companyId,
      impersonatedBy: superAdminId,
    });
  }

  async stopImpersonation(originalUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: originalUserId },
      include: { roles: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const roles = user.roles.map((r) => r.role);
    return this.generateTokens({
      sub: user.id,
      email: user.email,
      activeRole: user.primaryRole,
      roles,
      tenantId: user.tenantId,
      companyId: user.companyId,
      impersonatedBy: null,
    });
  }

  private async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
