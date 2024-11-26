import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { AgentExpansionDto } from '@/modules/core/agents/dto/agent-expansion.dto';
import { ConnectionExpansionDto } from '@/modules/core/connections/dto/connection-expansion.dto';
import { ExecutionExpansionDto } from '@/modules/core/executions/dto/execution-expansion.dto';
import { KnowledgeExpansionDto } from '@/modules/core/knowledge/dto/knowledge-expansion.dto';
import { ProjectExpansionDto } from '@/modules/core/projects/dto/project-expansion.dto';
import { TaskExpansionDto } from '@/modules/core/tasks/dto/task-expansion.dto';
import { UserExpansionDto } from '@/modules/core/users/dto/user-expansion.dto';
import { VariableExpansionDto } from '@/modules/core/variables/dto/variable-expansion.dto';
import { WorkflowTemplateExpansionDto } from '@/modules/core/workflow-templates/dto/workflow-template-expansion.dto';
import { WorkflowExpansionDto } from '@/modules/core/workflows/dto/workflow-expansion.dto';
import { WorkspaceUserExpansionDto } from '@/modules/core/workspace-users/dto/workspace-user-expansion.dto';
import { WorkspaceExpansionDto } from '@/modules/core/workspaces/dto/workspace-expansion.dto';
import { CreditExpansionDto } from '@/modules/global/credits/dto/credit-expansion.dto';

/**
 * Also make sure you add all your include type dtos to the expansionDtoMap below.
 */

const expansionDtoMap = {
  users: UserExpansionDto,
  workspaces: WorkspaceExpansionDto,
  'workspace-users': WorkspaceUserExpansionDto,
  projects: ProjectExpansionDto,
  workflows: WorkflowExpansionDto,
  workflowTemplates: WorkflowTemplateExpansionDto,
  agents: AgentExpansionDto,
  tasks: TaskExpansionDto,
  executions: ExecutionExpansionDto,
  variables: VariableExpansionDto,
  connections: ConnectionExpansionDto,
  knowledge: KnowledgeExpansionDto,
  credits: CreditExpansionDto,
};

export const Expansion = createParamDecorator(
  async (data: keyof typeof expansionDtoMap, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const expansionParams = request.query.expansion as string;

    if (!data) {
      throw new BadRequestException('Expansion DTO type not found.');
    }

    if (expansionParams) {
      //Find the expansion DTO class for validation and whitelisting.
      const expansionDto = expansionDtoMap[data];

      if (!expansionDto) {
        throw Error(`Expansion DTO not found for: ${data}`);
      }

      // Split the comma-separated values and create an object
      const expansionsArray = expansionParams.split(',');
      const expansionsObject: Record<string, boolean> = {};

      expansionsArray.forEach((type) => {
        expansionsObject[type.trim()] = true;
      });

      //HACK: DELETING SOME PROPERTIES WE DONT WANT TO COME FROM CLIENT BUT WE WANT TO EXPOSE FOR THE SERVER
      delete expansionsObject.credentials; //for connections
      delete expansionsObject.metadata; //for connections

      // Convert the object to a DTO class and validate it.
      // values not in the DTO class will be excluded.
      const convertPlainToDtoClass = plainToClass(expansionDto, {
        ...expansionsObject,
      });

      const errors = await validate(convertPlainToDtoClass, {
        forbidNonWhitelisted: true,
        whitelist: true,
      });

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      return convertPlainToDtoClass;
    }

    return {};
  },
);
