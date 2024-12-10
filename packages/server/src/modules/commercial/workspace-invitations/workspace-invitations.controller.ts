import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BelongsTo } from '../../../decorators/belongs-to.decorator';
import { CommercialKey } from '../../../decorators/commercial.decorator';
import { Roles } from '../../../decorators/roles.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { CreateWorkspaceInvitationDto } from './dto/create-workspace-invitation.dto';
import { UpdateWorkspaceInvitationDto } from './dto/update-workspace-invitation.dto';
import { WorkspaceInvitationsService } from './workspace-invitations.service';

@Controller('workspace-invitations')
@ApiTags('Workspace Invitations')
@CommercialKey()
@ApiBearerAuth()
export class WorkspaceInvitationsController {
  constructor(
    private readonly workspaceInvitationsService: WorkspaceInvitationsService,
  ) {}

  @Get('me')
  findAllForEmail(@User() user: JwtUser) {
    return this.workspaceInvitationsService.findAllForEmail({
      email: user.email,
    });
  }

  @Post()
  @Roles(['MAINTAINER'])
  create(
    @User() user: JwtUser,
    @Body() createWorkspaceInvitationDto: CreateWorkspaceInvitationDto,
  ) {
    return this.workspaceInvitationsService.create({
      workspaceId: user.workspaceId,
      data: createWorkspaceInvitationDto,
    });
  }

  @Get()
  @Roles(['MAINTAINER'])
  findAllForWorkspace(@User() user: JwtUser) {
    return this.workspaceInvitationsService.findAllForWorkspace({
      workspaceId: user.workspaceId,
    });
  }

  @Get(':workspaceInvitationId')
  @Roles(['MAINTAINER'])
  findOne(@Param('workspaceInvitationId') workspaceInvitationId: string) {
    return this.workspaceInvitationsService.findOneById({
      invitationId: workspaceInvitationId,
    });
  }

  @Patch(':workspaceInvitationId')
  @Roles(['MAINTAINER'])
  update(
    @Param('workspaceInvitationId') workspaceInvitationId: string,
    @Body() updateWorkspaceInvitationDto: UpdateWorkspaceInvitationDto,
  ) {
    return this.workspaceInvitationsService.update({
      invitationId: workspaceInvitationId,
      data: updateWorkspaceInvitationDto,
    });
  }

  @Delete(':workspaceInvitationId')
  @Roles(['MAINTAINER'])
  delete(@Param('workspaceInvitationId') workspaceInvitationId: string) {
    return this.workspaceInvitationsService.delete({
      invitationId: workspaceInvitationId,
    });
  }

  @Post(':workspaceInvitationId/accept')
  @BelongsTo({ owner: 'me', key: 'workspaceInvitationId' })
  acceptInvitation(
    @Param('workspaceInvitationId') workspaceInvitationId: string,
  ) {
    return this.workspaceInvitationsService.acceptInvitation({
      invitationId: workspaceInvitationId,
      throwNotFoundException: true,
    });
  }

  @Post(':workspaceInvitationId/decline')
  @BelongsTo({ owner: 'me', key: 'workspaceInvitationId' })
  declineInvitation(
    @Param('workspaceInvitationId') workspaceInvitationId: string,
  ) {
    return this.workspaceInvitationsService.delete({
      invitationId: workspaceInvitationId,
    });
  }
}
