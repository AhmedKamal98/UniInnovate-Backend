import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlatformService } from './platform.service';

@ApiTags('Platform')
@Controller('platform')
export class PlatformController {
  constructor(private platformService: PlatformService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get platform service health (public)' })
  getHealth() {
    return this.platformService.getHealthStatus();
  }
}
