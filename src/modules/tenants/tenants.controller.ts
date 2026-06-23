import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role, EntityStatus, PlanTier } from '@prisma/client';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { PaginationDto } from '../../common/dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all tenants (universities)' })
  findAll(@Query() pagination: PaginationDto, @Query('status') status?: EntityStatus, @Query('plan') plan?: PlanTier) {
    return this.tenantsService.findAll({ ...pagination, status, plan });
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
  @ApiOperation({ summary: 'Get tenant by ID' })
  findById(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new tenant' })
  create(@Body() body: { name: string; country: string; city: string; plan?: PlanTier; brandingColor?: string }) {
    return this.tenantsService.create(body);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update tenant' })
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; country: string; city: string; plan: PlanTier; brandingColor: string }>) {
    return this.tenantsService.update(id, body);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update tenant status' })
  updateStatus(@Param('id') id: string, @Body() body: { status: EntityStatus }) {
    return this.tenantsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft-delete tenant' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
