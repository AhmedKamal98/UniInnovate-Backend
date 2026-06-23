import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { RequestUser } from '../../common/types';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('executive')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Executive platform report' })
  getExecutiveReport() {
    return this.reportsService.getExecutiveReport();
  }

  @Get('tto-operational')
  @Roles(Role.TTO, Role.UNIVERSITY_ADMIN)
  @ApiOperation({ summary: 'TTO operational report' })
  getTtoOperationalReport(@CurrentUser() user: RequestUser) {
    return this.reportsService.getTtoOperationalReport(user.tenantId ?? undefined);
  }
}
