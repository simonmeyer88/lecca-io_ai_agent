import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ServerConfig } from '../../../config/server.config';
import { BelongsTo } from '../../../decorators/belongs-to.decorator';
import { Expansion } from '../../../decorators/expansion.decorator';
import { FilterBy } from '../../../decorators/filter-by.decorator';
import { IncludeType } from '../../../decorators/include-type.decorator';
import { Roles } from '../../../decorators/roles.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { CreateWorkflowTemplateDto } from './dto/create-workflow-template.dto';
import { WorkflowTemplateExpansionDto } from './dto/workflow-template-expansion.dto';
import { WorkflowTemplateFilterByDto } from './dto/workflow-template-filter-by.dto';
import { WorkflowTemplateIncludeTypeDto } from './dto/workflow-template-include-type.dto';
import { WorkflowTemplatesService } from './workflow-templates.service';

@Controller('workflow-templates')
@ApiTags('Workflow Templates')
@ApiBearerAuth()
export class WorkflowTemplatesController {
  constructor(
    private readonly workflowTemplatesService: WorkflowTemplatesService,
  ) {}

  @Post()
  @Roles(['MEMBER'])
  create(
    @User() user: JwtUser,
    @Body() data: CreateWorkflowTemplateDto,
    @Expansion('workflowTemplates') expansion: WorkflowTemplateExpansionDto,
  ) {
    return this.workflowTemplatesService.create({
      data,
      workspaceId: user.workspaceId,
      expansion,
    });
  }

  @Get()
  findAllForWorkspace(
    @User() user: JwtUser,
    @IncludeType('workflowTemplates')
    includeType: WorkflowTemplateIncludeTypeDto,
    @FilterBy('workflowTemplates') filterBy: WorkflowTemplateFilterByDto,
    @Expansion('workflowTemplates') expansion: WorkflowTemplateExpansionDto,
  ) {
    return this.workflowTemplatesService.findAllForWorkspace({
      jwtUser: user,
      workspaceId: user.workspaceId,
      filterBy,
      includeType,
      expansion,
    });
  }

  @Get('shared')
  findAllShared(
    @User() user: JwtUser,
    @Query('sharedToType') sharedToType: 'workspace' | 'global',
  ) {
    return this.workflowTemplatesService.findAllShared({
      workspaceId: user.workspaceId,
      sharedToType,
    });
  }

  @Get(':workflowTemplateId')
  @Roles()
  findOne(
    @User() user: JwtUser,
    @Param('workflowTemplateId') workflowTemplateId: string,
    @Expansion('workflowTemplates') expansion: WorkflowTemplateExpansionDto,
  ) {
    return this.workflowTemplatesService.findOne({
      jwtUser: user,
      workflowTemplateId,
      expansion,
      throwNotFoundException: true,
    });
  }

  @Delete(':workflowTemplateId')
  @BelongsTo({
    owner: 'either',
    key: 'workflowTemplateId',
    roles: ['MAINTAINER'],
  })
  delete(@Param('workflowTemplateId') workflowTemplateId: string) {
    return this.workflowTemplatesService.delete({ workflowTemplateId });
  }

  @Post(':workflowTemplateId/shareToWorkspace')
  @Roles()
  @BelongsTo({
    owner: 'either',
    key: 'workflowTemplateId',
    roles: ['MAINTAINER'],
  })
  shareToWorkspace(
    @Param('workflowTemplateId') workflowTemplateId: string,
    @Expansion('workflowTemplates') expansion: WorkflowTemplateExpansionDto,
  ) {
    return this.workflowTemplatesService.shareToWorkspace({
      workflowTemplateId,
      expansion,
    });
  }

  @Post(':workflowTemplateId/shareGlobally')
  @Roles()
  @BelongsTo({
    owner: 'either',
    key: 'workflowTemplateId',
    roles: ['MAINTAINER'],
  })
  shareGlobally(
    @User() user: JwtUser,
    @Param('workflowTemplateId') workflowTemplateId: string,
    @Expansion('workflowTemplates') expansion: WorkflowTemplateExpansionDto,
  ) {
    if (!user.email.includes(ServerConfig.DEV_EMAIL_DOMAIN)) {
      throw new ForbiddenException('Only Lecca employees can share globally');
    }

    return this.workflowTemplatesService.shareGlobally({
      workflowTemplateId,
      expansion,
    });
  }

  @Get(':workflowTemplateId/shared')
  @Roles()
  findShared(
    @User() user: JwtUser,
    @Param('workflowTemplateId') workflowTemplateId: string,
  ) {
    return this.workflowTemplatesService.findShared({
      workflowTemplateId,
      workspaceUserId: user.workspaceUserId,
      workspaceId: user.workspaceId,
    });
  }
}
