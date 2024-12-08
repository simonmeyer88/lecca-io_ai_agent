import { PartialType } from '@nestjs/mapped-types';

import { CreateWorkflowDto } from './create-workflow.dto';

/**
 * `projectId` can't be updated for a workflow
 */
export class UpdateWorkflowDto extends PartialType(CreateWorkflowDto) {}
