import { Injectable } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.billingPlan.findMany({ orderBy: { price: 'asc' } });
  }

  async getInvoices(query: { tenantId?: string; status?: InvoiceStatus }) {
    const where: any = {};
    if (query.tenantId) where.tenantId = query.tenantId;
    if (query.status) where.status = query.status;

    return this.prisma.invoice.findMany({
      where,
      include: { tenant: { select: { id: true, name: true } }, plan: { select: { id: true, name: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async createInvoice(data: { tenantId: string; planId: string; amount: number; issuedAt: Date }) {
    return this.prisma.invoice.create({
      data: { id: uuid(), ...data },
    });
  }
}
