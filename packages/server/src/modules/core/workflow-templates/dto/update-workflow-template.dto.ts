import { PartialType } from '@nestjs/swagger';

import { CreateWorkflowTemplateDto } from './create-workflow-template.dto';

export class UpdateWorkflowTemplateDto extends PartialType(
  CreateWorkflowTemplateDto,
) {}
