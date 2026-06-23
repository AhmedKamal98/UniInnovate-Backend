import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EntityStatus } from '@prisma/client';
import { TimelineService } from './timeline.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { RequestUser } from '../../common/types';

@ApiTags('Timeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timeline')
export class TimelineController {
  constructor(private timelineService: TimelineService) {}

  @Get()
  @ApiOperation({ summary: 'Get timeline events for an entity' })
  findByEntity(@Query('entityType') entityType: string, @Query('entityId') entityId: string) {
    return this.timelineService.findByEntity(entityType, entityId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a timeline event' })
  create(
    @Body() body: { entityType: string; entityId: string; title: string; description?: string; statusSnapshot?: EntityStatus },
    @CurrentUser() user: RequestUser,
  ) {
    return this.timelineService.create({ ...body, authorId: user.id });
  }
}
