import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role, EntityStatus, LegalType } from '@prisma/client';
import { LegalService } from './legal.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Legal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('legal-records')
export class LegalController {
  constructor(private legalService: LegalService) {}

  @Get()
  @Roles(Role.TTO, Role.LEGAL)
  @ApiOperation({ summary: 'List legal records' })
  findAll(@Query('projectId') projectId?: string, @Query('type') type?: LegalType, @Query('status') status?: EntityStatus) {
    return this.legalService.findAll({ projectId, type, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get legal record by ID' })
  findById(@Param('id') id: string) {
    return this.legalService.findById(id);
  }

  @Post()
  @Roles(Role.LEGAL, Role.TTO)
  @ApiOperation({ summary: 'Create legal record' })
  create(@Body() body: { projectId: string; ownerId: string; type: LegalType; status?: EntityStatus; dueDate?: Date; notes?: string }) {
    return this.legalService.create(body);
  }

  @Patch(':id')
  @Roles(Role.LEGAL)
  @ApiOperation({ summary: 'Update legal record' })
  update(@Param('id') id: string, @Body() body: Partial<{ status: EntityStatus; notes: string; dueDate: Date }>) {
    return this.legalService.update(id, body);
  }

  @Post('upsert')
  @Roles(Role.LEGAL)
  @ApiOperation({ summary: 'Upsert legal record by project + type' })
  upsert(@Body() body: { projectId: string; type: LegalType; ownerId: string; status?: EntityStatus; dueDate?: Date; notes?: string }) {
    return this.legalService.upsert(body);
  }
}
