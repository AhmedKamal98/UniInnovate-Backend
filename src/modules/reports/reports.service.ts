import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getExecutiveReport() {
    const [tenants, companies, users, challenges, proposals, projects] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count(),
      this.prisma.challenge.count({ where: { status: { not: 'ARCHIVED' } } }),
      this.prisma.proposal.count(),
      this.prisma.project.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalUniversities: tenants,
      activeCompanies: companies,
      totalUsers: users,
      activeChallenges: challenges,
      proposalsSubmitted: proposals,
      projectsInProgress: projects,
    };
  }

  async getTtoOperationalReport(tenantId?: string) {
    const challengeWhere = tenantId ? { company: { users: { some: { tenantId } } } } : {};

    const [pendingChallenges, urgentChallenges, proposalsUnderReview, activeProjects, atRiskProjects] = await Promise.all([
      this.prisma.challenge.count({ where: { ...challengeWhere, status: 'PENDING' } }),
      this.prisma.challenge.count({ where: { ...challengeWhere, priority: 'URGENT' } }),
      this.prisma.proposal.count({ where: { status: 'UNDER_REVIEW' } }),
      this.prisma.project.count({ where: { status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { health: { not: 'ON_TRACK' } } }),
    ]);

    return {
      pendingChallenges,
      urgentChallenges,
      proposalsUnderReview,
      activeProjects,
      atRiskProjects,
    };
  }
}
