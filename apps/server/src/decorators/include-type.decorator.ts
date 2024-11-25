import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { ExecutionIncludeTypeDto } from '@/modules/core/executions/dto/execution-include-type.dto';
import { ProjectIncludeTypeDto } from '@/modules/core/projects/dto/project-include-type.dto';
import { UserIncludeTypeDto } from '@/modules/core/users/dto/user-include-type.dto';
import { VariableIncludeTypeDto } from '@/modules/core/variables/dto/variable-include-type.dto';
import { WorkflowIncludeTypeDto } from '@/modules/core/workflows/dto/workflow-include-type.dto';
import { WorkspaceUserIncludeTypeDto } from '@/modules/core/workspace-users/dto/workspace-user-include-type.dto';
import { ConnectionIncludeTypeDto } from '@/modules/core/connections/dto/connection-include-type.dto';
import { AgentIncludeTypeDto } from '@/modules/core/agents/dto/agent-include-type.dto';
import { TaskIncludeTypeDto } from '@/modules/core/tasks/dto/task-include-type.dto';
import { KnowledgeIncludeTypeDto } from '@/modules/core/knowledge/dto/knowledge-include-type.dto';
import { WorkflowTemplateIncludeTypeDto } from '@/modules/core/workflow-templates/dto/workflow-template-include-type.dto';
import { CreditIncludeTypeDto } from '@/modules/global/credits/dto/credit-include-type.dto';

/**
 * Also make sure you add all your include type dtos to the includeTypeDtoMap below.
 */

const includeTypeDtoMap = {
  users: UserIncludeTypeDto,
  'workspace-users': WorkspaceUserIncludeTypeDto,
  projects: ProjectIncludeTypeDto,
  workflows: WorkflowIncludeTypeDto,
  workflowTemplates: WorkflowTemplateIncludeTypeDto,
  agents: AgentIncludeTypeDto,
  tasks: TaskIncludeTypeDto,
  executions: ExecutionIncludeTypeDto,
  variables: VariableIncludeTypeDto,
  connections: ConnectionIncludeTypeDto,
  knowledge: KnowledgeIncludeTypeDto,
  credits: CreditIncludeTypeDto,
};

export const IncludeType = createParamDecorator(
  async (data: keyof typeof includeTypeDtoMap, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const includeTypesParam = request.query.includeType as string;

    if (!data) {
      throw new BadRequestException('IncludeType DTO type not found.');
    }

    if (includeTypesParam) {
      //Find the include type DTO class for validation and whitelisting.
      const includeTypeDto = includeTypeDtoMap[data];

      if (!includeTypeDto) {
        throw Error(`Include Type DTO not found for: ${data}`);
      }

      // Split the comma-separated values and create an object
      const includeTypesArray = includeTypesParam.split(',');
      const includeTypesObject: Record<string, boolean> = {};

      includeTypesArray.forEach((type) => {
        includeTypesObject[type.trim()] = true;
      });

      //HACK: DELETING SOME PROPERTIES WE DONT WANT TO COME FROM CLIENT BUT WE WANT TO EXPOSE FOR THE SERVER
      delete includeTypesObject.deleted;
      delete includeTypesObject.credentials; //for connections

      // Convert the object to a DTO class and validate it.
      // values not in the DTO class will be excluded.
      const convertPlainToDtoClass = plainToClass(includeTypeDto as any, {
        ...includeTypesObject,
      });

      const errors = await validate(convertPlainToDtoClass as any, {
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
