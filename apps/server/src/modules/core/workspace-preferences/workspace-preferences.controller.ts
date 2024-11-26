import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/decorators/roles.decorator';
import { User } from '@/decorators/user.decorator';
import { JwtUser } from '@/types/jwt-user.type';

import { UpdateWorkspacePreferencesDto } from './dto/update-workspace-preferences.dto';
import { WorkspacePreferencesService } from './workspace-preferences.service';

@Controller('workspace-preferences')
@ApiTags('Workspace Preferences')
@ApiBearerAuth()
export class WorkspacePreferencesController {
  constructor(
    private readonly workspacePreferencesService: WorkspacePreferencesService,
  ) {}

  @Get('me')
  @Roles()
  findMe(@User() user: JwtUser) {
    return this.workspacePreferencesService.findMe({
      workspaceId: user.workspaceId,
      throwNotFoundException: true,
    });
  }

  @Patch('me')
  @Roles(['MAINTAINER'])
  updateMe(@User() user: JwtUser, @Body() data: UpdateWorkspacePreferencesDto) {
    return this.workspacePreferencesService.updateMe({
      workspaceId: user.workspaceId,
      data,
    });
  }
}
