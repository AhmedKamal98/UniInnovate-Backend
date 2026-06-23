import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role, EntityStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { RequestUser } from '../../common/types';
import { PaginationDto } from '../../common/dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN, Role.TTO)
  @ApiOperation({ summary: 'List users (paginated, filterable)' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: EntityStatus,
    @Query('role') role?: Role,
    @CurrentUser() user?: RequestUser,
  ) {
    const tenantId = user?.activeRole === 'SUPER_ADMIN' ? undefined : user?.tenantId ?? undefined;
    return this.usersService.findAll({ ...pagination, status, role, tenantId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  create(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      roles: Role[];
      primaryRole: Role;
      tenantId?: string;
      companyId?: string;
      department?: string;
      title?: string;
    },
  ) {
    return this.usersService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  update(@Param('id') id: string, @Body() body: { name?: string; department?: string; title?: string }) {
    return this.usersService.update(id, body);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
  @ApiOperation({ summary: 'Update user status (activate/suspend)' })
  updateStatus(@Param('id') id: string, @Body() body: { status: EntityStatus }) {
    return this.usersService.updateStatus(id, body.status);
  }
}
