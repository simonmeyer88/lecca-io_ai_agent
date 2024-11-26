import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BelongsTo } from '@/decorators/belongs-to.decorator';
import { Expansion } from '@/decorators/expansion.decorator';
import { FilterBy } from '@/decorators/filter-by.decorator';
import { IncludeType } from '@/decorators/include-type.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { User } from '@/decorators/user.decorator';
import { JwtUser } from '@/types/jwt-user.type';

import { ExecutionExpansionDto } from './dto/execution-expansion.dto';
import { ExecutionFilterByDto } from './dto/execution-filter-by.dto';
import { ExecutionIncludeTypeDto } from './dto/execution-include-type.dto';
import { ManuallyRunWorkflowInputDataDto } from './dto/manually-run-workflow-input-data.dto';
import { ExecutionsService } from './executions.service';

@Controller('executions')
@ApiTags('Executions')
@ApiBearerAuth()
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Post('workflows/:workflowId/execute')
  @Roles(['MEMBER'])
  @BelongsTo({ owner: 'either', key: 'workflowId', roles: ['MAINTAINER'] })
  manuallyExecuteWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() body: ManuallyRunWorkflowInputDataDto,
  ) {
    return this.executionsService.manuallyExecuteWorkflow({
      workflowId,
      skipQueue: true,
      inputData: body.inputData,
    });
  }

  @Get()
  @Roles(['MEMBER'])
  findAll(
    @User() user: JwtUser,
    @IncludeType('executions') includeType: ExecutionIncludeTypeDto,
    @Expansion('executions') expansion: ExecutionExpansionDto,
    @FilterBy('executions') filterBy: ExecutionFilterByDto,
  ) {
    return this.executionsService.findAllForWorkspace({
      jwtUser: user,
      workspaceId: user.workspaceId,
      expansion,
      includeType,
      filterBy,
    });
  }

  @Get(':executionId')
  @Roles()
  @BelongsTo({ owner: 'either', key: 'executionId', roles: ['MAINTAINER'] })
  findOne(
    @Param('executionId') executionId: string,
    @Expansion('executions') expansion: ExecutionExpansionDto,
  ) {
    return this.executionsService.findOne({
      executionId,
      expansion,
      throwNotFoundException: true,
    });
  }

  @Get(':executionId/hasUpdates')
  @Roles()
  @BelongsTo({ owner: 'either', key: 'executionId', roles: ['MAINTAINER'] })
  checkIfExecutionUpdatedAtHasChanged(
    @Param('executionId') executionId: string,
    @Query('updatedAt') updatedAt: string,
  ) {
    if (!updatedAt) {
      throw new BadRequestException('updatedAt query param is required');
    }

    return this.executionsService.checkIfExecutionUpdatedAtHasChanged({
      executionId,
      updatedAt: updatedAt,
    });
  }

  @Delete(':executionId')
  @Roles()
  @BelongsTo({ owner: 'either', key: 'executionId', roles: ['MAINTAINER'] })
  delete(@Param('executionId') executionId: string) {
    return this.executionsService.delete({
      executionId,
    });
  }
}
