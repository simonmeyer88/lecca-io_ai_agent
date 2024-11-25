import { Module } from '@nestjs/common';
import { WorkflowTemplatesService } from './workflow-templates.service';
import { WorkflowTemplatesController } from './workflow-templates.controller';

@Module({
  controllers: [WorkflowTemplatesController],
  providers: [WorkflowTemplatesService],
  exports: [WorkflowTemplatesService],
})
export class WorkflowTemplatesModule {}
