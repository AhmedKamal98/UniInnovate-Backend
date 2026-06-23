import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role, EntityStatus, Visibility } from '@prisma/client';
import { OpportunitiesService } from './opportunities.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { PaginationDto } from '../../common/dto';

@ApiTags('Opportunities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private opportunitiesService: OpportunitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List opportunities' })
  findAll(@Query() pagination: PaginationDto, @Query('status') status?: EntityStatus, @Query('visibility') visibility?: Visibility) {
    return this.opportunitiesService.findAll({ ...pagination, status, visibility });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get opportunity by ID' })
  findById(@Param('id') id: string) {
    return this.opportunitiesService.findById(id);
  }

  @Post()
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Create opportunity from challenge' })
  create(@Body() body: { challengeId: string; title: string; requiredSkills: string[]; deadline?: Date; ndaRequired?: boolean; visibility?: Visibility; mentorId?: string }) {
    return this.opportunitiesService.create(body);
  }

  @Patch(':id')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Update opportunity' })
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; requiredSkills: string[]; deadline: Date; visibility: Visibility; mentorId: string }>) {
    return this.opportunitiesService.update(id, body);
  }

  @Post(':id/publish')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Publish opportunity' })
  publish(@Param('id') id: string) {
    return this.opportunitiesService.publish(id);
  }
}
