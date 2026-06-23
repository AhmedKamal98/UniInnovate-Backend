import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role, InvoiceStatus } from '@prisma/client';
import { BillingService } from './billing.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List billing plans' })
  getPlans() {
    return this.billingService.getPlans();
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices' })
  getInvoices(@Query('tenantId') tenantId?: string, @Query('status') status?: InvoiceStatus) {
    return this.billingService.getInvoices({ tenantId, status });
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Create invoice' })
  createInvoice(@Body() body: { tenantId: string; planId: string; amount: number; issuedAt: Date }) {
    return this.billingService.createInvoice(body);
  }
}
