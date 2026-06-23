import { Controller, Get, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SettingsService } from './settings.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { RequestUser } from '../../common/types';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('theme')
  @ApiOperation({ summary: 'Get theme settings for current tenant' })
  getTheme(@CurrentUser() user: RequestUser) {
    return this.settingsService.getTheme(user.tenantId!);
  }

  @Put('theme')
  @Roles(Role.SUPER_ADMIN, Role.UNIVERSITY_ADMIN)
  @ApiOperation({ summary: 'Save theme settings' })
  saveTheme(@CurrentUser() user: RequestUser, @Body() body: any) {
    return this.settingsService.saveTheme(user.tenantId!, body);
  }

  @Get('feature-flags')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List feature flags' })
  getFeatureFlags() {
    return this.settingsService.getFeatureFlags();
  }

  @Patch('feature-flags/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Toggle feature flag' })
  updateFeatureFlag(@Param('id') id: string, @Body() body: { enabled: boolean }) {
    return this.settingsService.updateFeatureFlag(id, body.enabled);
  }
}
