import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MentorsService } from './mentors.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Mentors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mentors')
export class MentorsController {
  constructor(private mentorsService: MentorsService) {}

  @Get()
  @Roles(Role.TTO, Role.UNIVERSITY_ADMIN)
  @ApiOperation({ summary: 'List mentors' })
  findAll(@Query('available') available?: boolean, @Query('expertise') expertise?: string) {
    return this.mentorsService.findAll({ available, expertise });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mentor by ID' })
  findById(@Param('id') id: string) {
    return this.mentorsService.findById(id);
  }

  @Post()
  @Roles(Role.TTO, Role.UNIVERSITY_ADMIN)
  @ApiOperation({ summary: 'Create mentor profile' })
  create(@Body() body: { userId: string; expertise: string[] }) {
    return this.mentorsService.create(body);
  }

  @Patch(':id')
  @Roles(Role.TTO, Role.MENTOR)
  @ApiOperation({ summary: 'Update mentor profile' })
  update(@Param('id') id: string, @Body() body: Partial<{ expertise: string[]; available: boolean; workload: number }>) {
    return this.mentorsService.update(id, body);
  }

  @Post(':id/assign')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Assign mentor to project' })
  assign(@Param('id') id: string, @Body() body: { projectId: string }) {
    return this.mentorsService.assignToProject(id, body.projectId);
  }
}
