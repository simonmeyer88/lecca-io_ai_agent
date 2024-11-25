import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtUser } from '@/types/jwt-user.type';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowAccessedByWorkspaceUserEventPayload } from '@/types/event-payloads/workflow-access-by-workspace-user-event-payload.type';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowExpansionDto } from './dto/workflow-expansion.dto';
import { WorkflowFilterByDto } from './dto/workflow-filter-by.dto';
import { WorkflowIncludeTypeDto } from './dto/workflow-include-type.dto';
import { WorkflowsService } from './workflows.service';
import { BelongsTo } from '@/decorators/belongs-to.decorator';
import { User } from '@/decorators/user.decorator';
import { Expansion } from '@/decorators/expansion.decorator';
import { IncludeType } from '@/decorators/include-type.decorator';
import { FilterBy } from '@/decorators/filter-by.decorator';

@Controller('projects/:projectId/workflows')
@ApiTags('Workflows')
@ApiBearerAuth()
export class ProjectWorkflowsController {
  constructor(
    private readonly workflowsService: WorkflowsService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @BelongsTo({ owner: 'either', key: 'projectId', roles: ['MAINTAINER'] })
  async create(
    @User() user: JwtUser,
    @Body() data: CreateWorkflowDto,
    @Expansion('workflows') expansion: WorkflowExpansionDto,
    @Param('projectId') projectId: string,
  ) {
    const workflow = await this.workflowsService.create({
      data,
      projectId,
      workspaceId: user.workspaceId,
      expansion,
    });

    this.eventEmitter.emit('workflow.accessed-by-workspace-user', {
      workflowId: workflow.id,
      workspaceUserId: user.workspaceUserId,
    } as WorkflowAccessedByWorkspaceUserEventPayload);

    return workflow;
  }
}

@Controller('workflows')
@ApiTags('Workflows')
@ApiBearerAuth()
export class WorkflowsController {
  constructor(
    private readonly workflowsService: WorkflowsService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get()
  findAllForWorkspace(
    @User() user: JwtUser,
    @IncludeType('workflows') includeType: WorkflowIncludeTypeDto,
    @Expansion('workflows') expansion: WorkflowExpansionDto,
    @FilterBy('workflows') filterBy: WorkflowFilterByDto,
  ) {
    return this.workflowsService.findAllForWorkspace({
      jwtUser: user,
      workspaceId: user.workspaceId,
      includeType,
      expansion,
      filterBy,
    });
  }

  @Get('recent-for-workspace-user')
  findRecentForWorkspaceUser(
    @User() user: JwtUser,
    @Expansion('workflows') expansion: WorkflowExpansionDto,
  ) {
    return this.workflowsService.findRecentForWorkspaceUser({
      workspaceUserId: user.workspaceUserId,
      expansion,
    });
  }

  @Get(':workflowId')
  @BelongsTo({ owner: 'either', key: 'workflowId', roles: ['MAINTAINER'] })
  async findOne(
    @User() user: JwtUser,
    @Param('workflowId') workflowId: string,
    @Expansion('workflows') expansion: WorkflowExpansionDto,
  ) {
    const workflow = await this.workflowsService.findOne({
      workflowId,
      expansion,
      throwNotFoundException: true,
    });

    this.eventEmitter.emit('workflow.accessed-by-workspace-user', {
      workflowId,
      workspaceUserId: user.workspaceUserId,
    } as WorkflowAccessedByWorkspaceUserEventPayload);

    return workflow;
  }

  @Patch(':workflowId')
  @BelongsTo({ owner: 'either', key: 'workflowId', roles: ['MAINTAINER'] })
  async update(
    @User() user: JwtUser,
    @Param('workflowId') workflowId: string,
    @Body() data: UpdateWorkflowDto,
    @Expansion('workflows') expansion: WorkflowExpansionDto,
  ) {
    const workflow = await this.workflowsService.update({
      workflowId,
      workspaceId: user.workspaceId,
      data,
      expansion,
    });

    this.eventEmitter.emit('workflow.accessed-by-workspace-user', {
      workflowId,
      workspaceUserId: user.workspaceUserId,
    } as WorkflowAccessedByWorkspaceUserEventPayload);

    return workflow;
  }

  @Delete(':workflowId')
  @BelongsTo({ owner: 'either', key: 'workflowId', roles: ['MAINTAINER'] })
  delete(@Param('workflowId') workflowId: string) {
    return this.workflowsService.delete({ workflowId });
  }

  @Post(':workflowId/checkAndRun')
  @BelongsTo({ owner: 'either', key: 'workflowId', roles: ['MAINTAINER'] })
  checkForLatestPollingItemAndRun(@Param('workflowId') workflowId: string) {
    return this.workflowsService.manuallyCheckAndRunLatestPollingItemForWorkflow(
      {
        workflowId,
      },
    );
  }

  @Post(':workflowId/testing-webhook-trigger')
  @BelongsTo({ owner: 'either', key: 'workflowId', roles: ['MAINTAINER'] })
  async setTestingWebhookToTrue(@Param('workflowId') workflowId: string) {
    //When we click "Save & Listen", it will listen on the actual webhook endpoint.

    return this.workflowsService.setTestingWebhookToTrue({
      workflowId,
    });
  }

  @Get(':workflowId/test-webhook-data')
  @BelongsTo({ owner: 'either', key: 'workflowId', roles: ['MAINTAINER'] })
  async getTestWebhookDataFromPollStorageIfNotListeningAnymore(
    @Param('workflowId') workflowId: string,
  ) {
    //We will poll this endpoint until we get the data back
    //It will return 404 if the data is not there.

    return this.workflowsService.getTestWebhookDataFromPollStorageIfNotListeningAnymore(
      {
        workflowId,
      },
    );
  }
}
