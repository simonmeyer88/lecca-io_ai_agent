import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BelongsTo } from '../../../decorators/belongs-to.decorator';
import { Expansion } from '../../../decorators/expansion.decorator';
import { Roles } from '../../../decorators/roles.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { BetaKeyDto } from './dto/beta-key.dto';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { RemoveWorkspaceUserFromWorkspaceDto } from './dto/remove-workspace-user-from-workspace.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { WorkspaceExpansionDto } from './dto/workspace-expansion.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@ApiTags('Workspaces')
@ApiBearerAuth()
export class WorkspacesController {
  constructor(private readonly workspaceService: WorkspacesService) {}

  @Post()
  create(
    @User() user: JwtUser,
    @Body() data: CreateWorkspaceDto,
    @Expansion('workspaces') expansion: WorkspaceExpansionDto,
  ) {
    return this.workspaceService.create({
      data,
      createdByUserId: user.userId,
      expansion,
    });
  }

  @Get()
  @Roles()
  findAllForUser(
    @User() user: JwtUser,
    @Expansion('workspaces') expansion: WorkspaceExpansionDto,
  ) {
    return this.workspaceService.findAllForUser({
      userId: user.userId,
      expansion,
    });
  }

  @Get('me')
  @Roles()
  findMe(@User() user: JwtUser) {
    return this.workspaceService.findMe({
      workspaceId: user.workspaceId,
      throwNotFoundException: true,
    });
  }

  @Patch('me')
  @Roles(['MAINTAINER'])
  updateMe(@User() user: JwtUser, @Body() data: UpdateWorkspaceDto) {
    return this.workspaceService.updateMe({
      workspaceId: user.workspaceId,
      data,
    });
  }

  @Post('remove')
  @Roles(['MAINTAINER'])
  removeWorkspaceUserFromWorkspace(
    @User() user: JwtUser,
    @Body() removeDto: RemoveWorkspaceUserFromWorkspaceDto,
  ) {
    return this.workspaceService.removeWorkspaceUserFromWorkspace({
      workspaceUserId: removeDto.workspaceUserId,
      workspaceId: user.workspaceId,
    });
  }

  @Get(':workspaceId')
  @BelongsTo({ owner: 'workspace', key: 'workspaceId' })
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Expansion('workspaces') expansion: WorkspaceExpansionDto,
  ) {
    return this.workspaceService.findOne({
      workspaceId,
      expansion,
      throwNotFoundException: true,
    });
  }

  @Put(':workspaceId')
  @BelongsTo({ owner: 'workspace', key: 'workspaceId' })
  setActiveWorkspace(
    @User() user: JwtUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspaceService.setActiveWorkspaceForUser({
      userId: user.userId,
      workspaceId,
    });
  }

  @Post(':workspaceId/leave')
  @BelongsTo({ owner: 'workspace', key: 'workspaceId' })
  leaveWorkspace(
    @User() user: JwtUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspaceService.removeWorkspaceUserFromWorkspace({
      workspaceUserId: user.workspaceUserId,
      workspaceId: workspaceId,
    });
  }

  @Post(':workspaceId/logo-post-url')
  @BelongsTo({ owner: 'workspace', key: 'workspaceId', roles: ['MAINTAINER'] })
  getPresignedPostUrlForProfileImage(
    @Param('workspaceId') workspaceId: string,
    @Body() data: UpdateLogoDto,
  ) {
    //This doesn't update the logo, it just returns a presigned post url to upload a newlogo
    return this.workspaceService.getPresignedPostUrlForProfileImage({
      fileName: data.fileName,
      workspaceId,
    });
  }

  @Delete(':workspaceId')
  @Roles(['MAINTAINER'])
  @BelongsTo({ owner: 'workspace', key: 'workspaceId' })
  delete(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.delete({ workspaceId });
  }

  @Post('/validate-workspace-beta-key')
  @Roles(['MAINTAINER'])
  validateWorkspaceBetaKey(@User() user: JwtUser, @Body() data: BetaKeyDto) {
    return this.workspaceService.validateWorkspaceBetaKey({
      workspaceId: user.workspaceId,
      betaKey: data.betaKey,
    });
  }

  @Post('upload-temp-file-url')
  @Roles()
  async uploadTempFile(@User() user: JwtUser, @Body() data: UploadFileDto) {
    return await this.workspaceService.getPresignedPostUrlForTempFile({
      fileName: data.fileName,
      workspaceId: user.workspaceId,
    });
  }
}
