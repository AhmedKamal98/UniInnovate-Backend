import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { RequestUser } from '../../common/types';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'List files for an entity' })
  findByEntity(@Query('entityType') entityType: string, @Query('entityId') entityId: string) {
    return this.filesService.findByEntity(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata (for presigned URL generation)' })
  findById(@Param('id') id: string) {
    return this.filesService.findById(id);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Register file upload metadata' })
  create(
    @Body() body: { entityType: string; entityId: string; filename: string; mimeType: string; sizeBytes: number; storageKey: string },
    @CurrentUser() user: RequestUser,
  ) {
    return this.filesService.create({ ...body, uploadedBy: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}
