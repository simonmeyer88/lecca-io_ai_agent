import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BelongsTo } from '../../../decorators/belongs-to.decorator';
import { Roles } from '../../../decorators/roles.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { CreateProjectInvitationDto } from './dto/create-project-invitation.dto';
import { ProjectInvitationsService } from './project-invitations.service';

@Controller('projects/:projectId/project-invitations')
@ApiTags('Project Invitations')
@ApiBearerAuth()
export class ProjectProjectInvitationsController {
  constructor(
    private readonly projectInvitationsService: ProjectInvitationsService,
  ) {}

  @Post()
  @BelongsTo({ owner: 'either', key: 'projectId', roles: ['MAINTAINER'] })
  create(
    @Body() data: CreateProjectInvitationDto,
    @Param('projectId') projectId: string,
  ) {
    return this.projectInvitationsService.create({
      data,
      projectId,
    });
  }

  @Get()
  @BelongsTo({ owner: 'either', key: 'projectId', roles: ['MAINTAINER'] })
  findAllForProject(@Param('projectId') projectId: string) {
    return this.projectInvitationsService.findAllForProject({
      projectId: projectId,
    });
  }
}

@Controller('project-invitations')
@ApiTags('Project Invitations')
@ApiBearerAuth()
export class ProjectInvitationsController {
  constructor(
    private readonly projectInvitationsService: ProjectInvitationsService,
  ) {}

  @Get('me')
  @Roles()
  findAllForEmail(@User() user: JwtUser) {
    return this.projectInvitationsService.findAllForWorkspaceUser({
      workspaceUserId: user.workspaceUserId,
    });
  }

  @Get(':projectInvitationId')
  @BelongsTo({
    owner: 'either',
    key: 'projectInvitationId',
    roles: ['MAINTAINER'],
  })
  findOne(@Param('projectInvitationId') projectInvitationId: string) {
    return this.projectInvitationsService.findOne({
      invitationId: projectInvitationId,
    });
  }

  @Delete(':projectInvitationId')
  @BelongsTo({
    owner: 'either',
    key: 'projectInvitationId',
    roles: ['MAINTAINER'],
  })
  delete(@Param('projectInvitationId') projectInvitationId: string) {
    return this.projectInvitationsService.delete({
      invitationId: projectInvitationId,
    });
  }

  @Post(':projectInvitationId/accept')
  @BelongsTo({
    owner: 'me',
    key: 'projectInvitationId',
  })
  @BelongsTo({ owner: 'me', key: 'projectInvitationId' })
  acceptInvitation(@Param('projectInvitationId') projectInvitationId: string) {
    return this.projectInvitationsService.acceptInvitation({
      invitationId: projectInvitationId,
    });
  }
}
