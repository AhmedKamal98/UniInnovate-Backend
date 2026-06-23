import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { RequestUser } from '../../common/types';
import { PaginationDto } from '../../common/dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.TTO)
  @ApiOperation({ summary: 'List audit logs' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('module') module?: string,
    @Query('actorUserId') actorUserId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @CurrentUser() user?: RequestUser,
  ) {
    const tenantId = user?.activeRole === 'SUPER_ADMIN' ? undefined : user?.tenantId ?? undefined;
    return this.auditService.findAll({ ...pagination, module, actorUserId, tenantId, from, to });
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get audit log by ID' })
  findById(@Param('id') id: string) {
    return this.auditService.findById(id);
  }
}
