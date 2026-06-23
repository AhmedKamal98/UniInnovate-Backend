import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role, EntityStatus } from '@prisma/client';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { PaginationDto } from '../../common/dto';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.TTO, Role.COMPANY)
  @ApiOperation({ summary: 'List companies' })
  findAll(@Query() pagination: PaginationDto, @Query('status') status?: EntityStatus, @Query('flagged') flagged?: boolean) {
    return this.companiesService.findAll({ ...pagination, status, flagged });
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.TTO, Role.COMPANY)
  @ApiOperation({ summary: 'Get company by ID' })
  findById(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a company' })
  create(@Body() body: { name: string; industry: string; ownerUserId: string }) {
    return this.companiesService.create(body);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY)
  @ApiOperation({ summary: 'Update company' })
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; industry: string }>) {
    return this.companiesService.update(id, body);
  }

  @Patch(':id/flag')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Flag/unflag company' })
  flag(@Param('id') id: string, @Body() body: { flagged: boolean }) {
    return this.companiesService.flag(id, body.flagged);
  }
}
