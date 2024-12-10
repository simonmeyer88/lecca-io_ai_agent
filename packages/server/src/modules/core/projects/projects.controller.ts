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
import { Expansion } from '../../../decorators/expansion.decorator';
import { IncludeType } from '../../../decorators/include-type.decorator';
import { Roles } from '../../../decorators/roles.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectExpansionDto } from './dto/project-expansion.dto';
import { ProjectIncludeTypeDto } from './dto/project-include-type.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@ApiTags('Projects')
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(['MEMBER'])
  create(
    @User() user: JwtUser,
    @Body() data: CreateProjectDto,
    @Expansion('projects') expansion: ProjectExpansionDto,
  ) {
    return this.projectsService.create({
      data,
      createdByWorkspaceUserId: user.workspaceUserId,
      workspaceId: user.workspaceId,
      expansion,
    });
  }

  @Get()
  findAllForWorkspace(
    @User() user: JwtUser,
    @IncludeType('projects') includeType: ProjectIncludeTypeDto,
    @Expansion('projects') expansion: ProjectExpansionDto,
  ) {
    return this.projectsService.findAllForWorkspace({
      jwtUser: user,
      workspaceId: user.workspaceId,
      includeType,
      expansion,
    });
  }

  @Get(':projectId')
  @Roles()
  @BelongsTo({ owner: 'either', key: 'projectId', roles: ['MAINTAINER'] })
  findOne(
    @Param('projectId') projectId: string,
    @IncludeType('projects') includeType: ProjectIncludeTypeDto,
    @Expansion('projects') expansion: ProjectExpansionDto,
  ) {
    return this.projectsService.findOne({
      projectId,
      expansion,
      throwNotFoundException: true,
    });
  }

  @Patch(':projectId')
  @BelongsTo({ owner: 'either', key: 'projectId', roles: ['MAINTAINER'] })
  update(
    @Param('projectId') projectId: string,
    @Body() data: UpdateProjectDto,
    @IncludeType('projects') includeType: ProjectIncludeTypeDto,
    @Expansion('projects') expansion: ProjectExpansionDto,
  ) {
    return this.projectsService.update({
      projectId,
      data,
      includeType,
      expansion,
    });
  }

  @Delete(':projectId')
  @BelongsTo({ owner: 'either', key: 'projectId', roles: ['MAINTAINER'] })
  delete(@Param('projectId') projectId: string) {
    return this.projectsService.delete({ projectId });
  }

  @Post(':projectId/leave')
  @BelongsTo({ owner: 'me', key: 'projectId' })
  leaveWorkspace(@User() user: JwtUser, @Param('projectId') projectId: string) {
    return this.projectsService.leaveProject({
      workspaceUserId: user.workspaceUserId,
      projectId: projectId,
    });
  }
}
