import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role, EntityStatus, Priority } from '@prisma/client';
import { ChallengesService } from './challenges.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { RequestUser } from '../../common/types';
import { PaginationDto } from '../../common/dto';

@ApiTags('Challenges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('challenges')
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  @Get()
  @ApiOperation({ summary: 'List challenges' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: EntityStatus,
    @Query('priority') priority?: Priority,
    @Query('companyId') companyId?: string,
  ) {
    return this.challengesService.findAll({ ...pagination, status, priority, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get challenge by ID' })
  findById(@Param('id') id: string) {
    return this.challengesService.findById(id);
  }

  @Post()
  @Roles(Role.COMPANY)
  @ApiOperation({ summary: 'Create a new challenge' })
  create(@Body() body: { title: string; industry: string; budget: number; summary: string; priority?: Priority }, @CurrentUser() user: RequestUser) {
    return this.challengesService.create({ ...body, companyId: user.companyId! });
  }

  @Patch(':id')
  @Roles(Role.COMPANY, Role.TTO)
  @ApiOperation({ summary: 'Update challenge' })
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; industry: string; budget: number; summary: string; priority: Priority }>) {
    return this.challengesService.update(id, body);
  }

  @Post(':id/submit')
  @Roles(Role.COMPANY)
  @ApiOperation({ summary: 'Submit challenge to TTO' })
  submit(@Param('id') id: string) {
    return this.challengesService.submit(id);
  }

  @Post(':id/assign-reviewer')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Assign reviewer to challenge' })
  assignReviewer(@Param('id') id: string, @Body() body: { reviewerId: string }) {
    return this.challengesService.assignReviewer(id, body.reviewerId);
  }

  @Post(':id/approve')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Approve challenge' })
  approve(@Param('id') id: string) {
    return this.challengesService.approve(id);
  }

  @Post(':id/reject')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Reject challenge' })
  reject(@Param('id') id: string) {
    return this.challengesService.reject(id);
  }

  @Post(':id/request-info')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Request more info from company' })
  requestInfo(@Param('id') id: string, @Body() body: { message: string }) {
    return this.challengesService.requestInfo(id, body.message);
  }
}
