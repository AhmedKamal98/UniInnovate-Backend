import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role, EntityStatus } from '@prisma/client';
import { ProposalsService } from './proposals.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { RequestUser } from '../../common/types';
import { PaginationDto } from '../../common/dto';

@ApiTags('Proposals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proposals')
export class ProposalsController {
  constructor(private proposalsService: ProposalsService) {}

  @Get()
  @ApiOperation({ summary: 'List proposals' })
  findAll(@Query() pagination: PaginationDto, @Query('opportunityId') opportunityId?: string, @Query('status') status?: EntityStatus) {
    return this.proposalsService.findAll({ ...pagination, opportunityId, status });
  }

  @Get('compare')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Compare proposals side-by-side' })
  compare(@Query('ids') ids: string) {
    return this.proposalsService.compare(ids.split(','));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get proposal by ID' })
  findById(@Param('id') id: string) {
    return this.proposalsService.findById(id);
  }

  @Post()
  @Roles(Role.STUDENT, Role.RESEARCHER)
  @ApiOperation({ summary: 'Create a proposal draft' })
  create(@Body() body: { opportunityId: string; title: string; teamName: string; budgetEstimate?: number }, @CurrentUser() user: RequestUser) {
    return this.proposalsService.create({ ...body, universityId: user.tenantId! });
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT, Role.RESEARCHER)
  @ApiOperation({ summary: 'Submit proposal' })
  submit(@Param('id') id: string) {
    return this.proposalsService.submit(id);
  }

  @Post(':id/approve')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Approve proposal' })
  approve(@Param('id') id: string) {
    return this.proposalsService.approve(id);
  }

  @Post(':id/reject')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Reject proposal' })
  reject(@Param('id') id: string) {
    return this.proposalsService.reject(id);
  }

  @Post(':id/request-revision')
  @Roles(Role.TTO, Role.REVIEWER)
  @ApiOperation({ summary: 'Request revision' })
  requestRevision(@Param('id') id: string) {
    return this.proposalsService.requestRevision(id);
  }

  @Post(':id/send-to-company')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Send to company for validation' })
  sendToCompany(@Param('id') id: string) {
    return this.proposalsService.sendToCompany(id);
  }

  @Post(':id/select-winner')
  @Roles(Role.TTO)
  @ApiOperation({ summary: 'Select proposal as winner' })
  selectWinner(@Param('id') id: string, @Body() body: { recommendation: string }) {
    return this.proposalsService.selectWinner(id, body.recommendation);
  }
}
