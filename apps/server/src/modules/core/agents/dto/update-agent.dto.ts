import { PartialType } from '@nestjs/mapped-types';

import { CreateAgentDto } from './create-agent.dto';

/**
 * `projectId` can't be updated for a workflow
 */
export class UpdateAgentDto extends PartialType(CreateAgentDto) {}
