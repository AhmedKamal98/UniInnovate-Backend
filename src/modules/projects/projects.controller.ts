import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role, EntityStatus, ProjectHealth } from '@prisma/client';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { PaginationDto } from '../../common/dto';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects' })
  findAll(@Query() pagination: PaginationDto, @Query('status') status?: EntityStatus, @Query('health') health?: ProjectHealth, @Query('companyId') companyId?: string) {
    return this.projectsService.findAll({ ...pagination, status, health, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  findById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Create project from approved proposal' })
  create(@Body() body: { proposalId: string; companyId: string; mentorId: string; title: string; dueDate?: Date; opportunityId?: string }) {
    return this.projectsService.create(body);
  }

  @Patch(':id')
  @Roles(Role.TTO, Role.MENTOR)
  @ApiOperation({ summary: 'Update project' })
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; status: EntityStatus; health: ProjectHealth; progress: number; nextMilestone: string }>) {
    return this.projectsService.update(id, body);
  }

  @Patch(':id/progress')
  @Roles(Role.TTO, Role.MENTOR)
  @ApiOperation({ summary: 'Update project progress' })
  updateProgress(@Param('id') id: string, @Body() body: { progress: number; health: ProjectHealth; nextMilestone?: string }) {
    return this.projectsService.updateProgress(id, body.progress, body.health, body.nextMilestone);
  }
}
