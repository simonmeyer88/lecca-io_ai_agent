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
import { FilterBy } from '../../../decorators/filter-by.decorator';
import { IncludeType } from '../../../decorators/include-type.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { AgentsService } from './agents.service';
import { AgentExpansionDto } from './dto/agent-expansion.dto';
import { AgentFilterByDto } from './dto/agent-filter-by.dto';
import { AgentIncludeTypeDto } from './dto/agent-include-type.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Controller('projects/:projectId/agents')
@ApiTags('Agents')
@ApiBearerAuth()
export class ProjectAgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @BelongsTo({ owner: 'either', key: 'projectId', roles: ['MAINTAINER'] })
  async create(
    @Body() data: CreateAgentDto,
    @User() user: JwtUser,
    @Expansion('agents') expansion: AgentExpansionDto,
    @Param('projectId') projectId: string,
  ) {
    const agent = await this.agentsService.create({
      data,
      projectId,
      workspaceId: user.workspaceId,
      expansion,
    });

    return agent;
  }
}

@Controller('agents')
@ApiTags('Agents')
@ApiBearerAuth()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  findAllForWorkspace(
    @User() user: JwtUser,
    @IncludeType('agents') includeType: AgentIncludeTypeDto,
    @Expansion('agents') expansion: AgentExpansionDto,
    @FilterBy('agents') filterBy: AgentFilterByDto,
  ) {
    return this.agentsService.findAllForWorkspace({
      jwtUser: user,
      workspaceId: user.workspaceId,
      includeType,
      expansion,
      filterBy,
    });
  }

  @Get(':agentId')
  @BelongsTo({ owner: 'either', key: 'agentId', roles: ['MAINTAINER'] })
  async findOne(
    @Param('agentId') agentId: string,
    @Expansion('agents') expansion: AgentExpansionDto,
  ) {
    const agent = await this.agentsService.findOne({
      agentId,
      expansion,
      throwNotFoundException: true,
    });

    return agent;
  }

  @Patch(':agentId')
  @BelongsTo({ owner: 'either', key: 'agentId', roles: ['MAINTAINER'] })
  async update(
    @Param('agentId') agentId: string,
    @Body() data: UpdateAgentDto,
    @Expansion('agents') expansion: AgentExpansionDto,
  ) {
    const agent = await this.agentsService.update({
      agentId,
      data,
      expansion,
    });

    return agent;
  }

  @Delete(':agentId')
  @BelongsTo({ owner: 'either', key: 'agentId', roles: ['MAINTAINER'] })
  delete(@Param('agentId') agentId: string) {
    return this.agentsService.delete({
      agentId,
    });
  }
}
