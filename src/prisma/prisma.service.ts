import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async setTenantContext(tenantId: string | null, isSuperAdmin: boolean) {
    if (isSuperAdmin) {
      await this.$executeRawUnsafe(`SET LOCAL app.is_super_admin = true`);
    }
    if (tenantId) {
      await this.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
    }
  }
}
