import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { AgentFilterByDto } from '../modules/core/agents/dto/agent-filter-by.dto';
import { ConnectionFilterByDto } from '../modules/core/connections/dto/connection-filter-by.dto';
import { ExecutionFilterByDto } from '../modules/core/executions/dto/execution-filter-by.dto';
import { KnowledgeFilterByDto } from '../modules/core/knowledge/dto/knowledge-filter-by.dto';
import { TaskFilterByDto } from '../modules/core/tasks/dto/task-filter-by.dto';
import { VariableFilterByDto } from '../modules/core/variables/dto/variable-filter-by.dto';
import { WorkflowTemplateFilterByDto } from '../modules/core/workflow-templates/dto/workflow-template-filter-by.dto';
import { WorkflowFilterByDto } from '../modules/core/workflows/dto/workflow-filter-by.dto';
import { WorkspaceUserFilterByDto } from '../modules/core/workspace-users/dto/workspace-user-filter-by.dto';
import { CreditFilterByDto } from '../modules/global/credits/dto/credit-filter-by.dto';

/**
 * Also make sure you add all your filer by dtos to the filterByDtoMap below.
 */

const filterByDtoMap = {
  workflows: WorkflowFilterByDto,
  workflowTemplates: WorkflowTemplateFilterByDto,
  agents: AgentFilterByDto,
  tasks: TaskFilterByDto,
  executions: ExecutionFilterByDto,
  'workspace-users': WorkspaceUserFilterByDto,
  connections: ConnectionFilterByDto,
  variables: VariableFilterByDto,
  knowledge: KnowledgeFilterByDto,
  credits: CreditFilterByDto,
};

export const FilterBy = createParamDecorator(
  async (data: keyof typeof filterByDtoMap, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const filterByParams = request.query.filterBy as string;

    if (!data) {
      throw new BadRequestException('Filter By DTO type not found.');
    }

    if (filterByParams) {
      //Find the filter by DTO class for validation and whitelisting.
      const filterByDto = filterByDtoMap[data];

      if (!filterByDto) {
        throw Error(`Filter By DTO not found for: ${data}`);
      }

      // Split the comma-separated values and create an object
      const filterByArray = filterByParams.split(',');
      const filterByObject: Record<string, string> = {};

      filterByArray.forEach((filter) => {
        //filter is a string like 'projectId:someid' or 'name:John'
        const [key, value] = filter.split(':');
        filterByObject[key.trim()] = value.trim();
      });

      // Convert the object to a DTO class and validate it.
      // values not in the DTO class will be excluded.
      const convertPlainToDtoClass = plainToClass(filterByDto as any, {
        ...filterByObject,
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
