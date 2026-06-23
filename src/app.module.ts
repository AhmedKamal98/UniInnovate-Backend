import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ChallengesModule } from './modules/challenges/challenges.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MentorsModule } from './modules/mentors/mentors.module';
import { LegalModule } from './modules/legal/legal.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { BillingModule } from './modules/billing/billing.module';
import { PlatformModule } from './modules/platform/platform.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FilesModule } from './modules/files/files.module';
import { TimelineModule } from './modules/timeline/timeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    CompaniesModule,
    ChallengesModule,
    OpportunitiesModule,
    ProposalsModule,
    ProjectsModule,
    MentorsModule,
    LegalModule,
    NotificationsModule,
    AuditModule,
    BillingModule,
    PlatformModule,
    SettingsModule,
    ReportsModule,
    FilesModule,
    TimelineModule,
  ],
})
export class AppModule {}
